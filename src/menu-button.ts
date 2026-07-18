/**
 * Accessible Menu Button — an implementation of the WAI-ARIA Menu Button pattern.
 *
 * Framework-agnostic on purpose: it progressively enhances semantic markup, so
 * it works in a WordPress block, a plain page, or any framework. A menu button
 * is a native `<button>` that opens a `role="menu"` of actions. It manages the
 * things keyboard and screen-reader users depend on:
 *   - `aria-haspopup="menu"` + `aria-expanded` + `aria-controls` on the trigger,
 *   - `role="menu"` labelled by the trigger, with `role="menuitem"` children,
 *   - a single tab stop plus roving focus so Arrow/Home/End move between items,
 *   - Enter/Space/ArrowDown/ArrowUp open the menu; Escape and outside clicks
 *     close it and return focus to the trigger.
 *
 * Expected markup (ids optional — they are generated if absent):
 *   <div data-menu>
 *     <button data-menu-button>Actions</button>
 *     <ul data-menu-list>
 *       <li data-menu-item>Duplicate</li>
 *       <li data-menu-item>Rename</li>
 *       <li data-menu-item>Delete</li>
 *     </ul>
 *   </div>
 */

export interface MenuButtonOptions {
  /** Called with the chosen item and its index when a menu item is activated. */
  onSelect?: (item: HTMLElement, index: number) => void;
}

export interface MenuButtonInstance {
  /** Open the menu and move focus to the first item. */
  open(): void;
  /** Close the menu and return focus to the trigger. */
  close(): void;
  /** Whether the menu is currently open. */
  readonly isOpen: boolean;
  /** Remove listeners and ARIA wiring. */
  destroy(): void;
}

let uid = 0;
const nextId = (prefix: string): string => `${prefix}-${(uid += 1)}`;

/**
 * Enhance a container into an accessible menu-button widget.
 *
 * @param root    The `[data-menu]` container.
 * @param options Behavioural options.
 * @returns A handle to control or tear down the widget.
 * @throws If the required trigger/menu/item structure is missing.
 */
export function createMenuButton(
  root: HTMLElement,
  options: MenuButtonOptions = {},
): MenuButtonInstance {
  const button = root.querySelector<HTMLElement>('[data-menu-button]');
  if (!button) {
    throw new Error('createMenuButton: missing [data-menu-button] element.');
  }
  const menu = root.querySelector<HTMLElement>('[data-menu-list]');
  if (!menu) {
    throw new Error('createMenuButton: missing [data-menu-list] element.');
  }
  const items = Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-item]'));
  if (items.length === 0) {
    throw new Error('createMenuButton: no [data-menu-item] elements found.');
  }

  const buttonId = button.id || (button.id = nextId('menu-button'));
  menu.id = menu.id || nextId('menu');
  button.setAttribute('aria-haspopup', 'menu');
  button.setAttribute('aria-controls', menu.id);
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-labelledby', buttonId);
  items.forEach((item) => {
    item.setAttribute('role', 'menuitem');
    item.setAttribute('tabindex', '-1');
  });

  let open = false;

  function render(): void {
    button!.setAttribute('aria-expanded', String(open));
    menu!.hidden = !open;
  }

  function focusItem(index: number): void {
    const item = items[(index + items.length) % items.length];
    item!.focus();
  }

  function openMenu(focusIndex = 0): void {
    if (!open) {
      open = true;
      render();
      root.ownerDocument.addEventListener('click', onDocumentClick, true);
    }
    focusItem(focusIndex);
  }

  function closeMenu(returnFocus = true): void {
    if (!open) return;
    open = false;
    render();
    root.ownerDocument.removeEventListener('click', onDocumentClick, true);
    if (returnFocus) button!.focus();
  }

  function currentIndex(): number {
    return items.indexOf(root.ownerDocument.activeElement as HTMLElement);
  }

  function activate(index: number): void {
    const item = items[index];
    if (!item) return;
    options.onSelect?.(item, index);
    closeMenu();
  }

  function onButtonKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        event.preventDefault();
        openMenu(0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        openMenu(items.length - 1);
        break;
      default:
    }
  }

  function onButtonClick(): void {
    if (open) closeMenu();
    else openMenu(0);
  }

  function onMenuKeydown(event: KeyboardEvent): void {
    const index = currentIndex();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusItem(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusItem(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusItem(0);
        break;
      case 'End':
        event.preventDefault();
        focusItem(items.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        closeMenu();
        break;
      case 'Tab':
        // Tabbing out of an open menu dismisses it without stealing focus.
        closeMenu(false);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        activate(index);
        break;
      default:
    }
  }

  const itemClickHandlers = items.map((item, i) => {
    const handler = (): void => activate(i);
    item.addEventListener('click', handler);
    return handler;
  });

  function onDocumentClick(event: MouseEvent): void {
    if (!root.contains(event.target as Node)) closeMenu(false);
  }

  button.addEventListener('keydown', onButtonKeydown);
  button.addEventListener('click', onButtonClick);
  menu.addEventListener('keydown', onMenuKeydown);

  render();

  return {
    open: () => openMenu(0),
    close: () => closeMenu(false),
    get isOpen() {
      return open;
    },
    destroy(): void {
      root.ownerDocument.removeEventListener('click', onDocumentClick, true);
      button.removeEventListener('keydown', onButtonKeydown);
      button.removeEventListener('click', onButtonClick);
      menu.removeEventListener('keydown', onMenuKeydown);
      items.forEach((item, i) => item.removeEventListener('click', itemClickHandlers[i]!));
    },
  };
}
