/**
 * Accessible Tabs — an implementation of the WAI-ARIA Tabs pattern.
 *
 * Framework-agnostic on purpose: it progressively enhances semantic markup, so
 * it works in a WordPress block, a plain page, or any framework. It manages the
 * three things keyboard and screen-reader users depend on:
 *   - roles + `aria-selected` + `aria-controls`/`aria-labelledby` wiring,
 *   - a single tab stop (roving `tabindex`) so Tab moves *out* of the tablist,
 *   - Arrow/Home/End navigation with automatic activation.
 *
 * Expected markup (ids optional — they are generated if absent):
 *   <div data-tabs>
 *     <div data-tablist aria-label="Sections">
 *       <button data-tab data-controls="p1">One</button>
 *       <button data-tab data-controls="p2">Two</button>
 *     </div>
 *     <div id="p1" data-tabpanel>…</div>
 *     <div id="p2" data-tabpanel>…</div>
 *   </div>
 */

export interface TabsOptions {
  /** 'horizontal' uses Left/Right arrows, 'vertical' uses Up/Down. */
  orientation?: 'horizontal' | 'vertical';
  /** Index selected on init. Defaults to 0. */
  selectedIndex?: number;
}

export interface TabsInstance {
  /** Programmatically select a tab by index. */
  select(index: number): void;
  /** Index of the currently selected tab. */
  readonly selectedIndex: number;
  /** Remove listeners and ARIA wiring. */
  destroy(): void;
}

let uid = 0;
const nextId = (prefix: string): string => `${prefix}-${(uid += 1)}`;

/**
 * Enhance a container into an accessible tabs widget.
 *
 * @param root    The `[data-tabs]` container.
 * @param options Behavioural options.
 * @returns A handle to control or tear down the widget.
 * @throws If the required tablist/tab/panel structure is missing.
 */
export function createTabs(root: HTMLElement, options: TabsOptions = {}): TabsInstance {
  const orientation = options.orientation ?? 'horizontal';

  const list = root.querySelector<HTMLElement>('[data-tablist]');
  if (!list) {
    throw new Error('createTabs: missing [data-tablist] element.');
  }

  const tabs = Array.from(list.querySelectorAll<HTMLElement>('[data-tab]'));
  if (tabs.length === 0) {
    throw new Error('createTabs: no [data-tab] elements found.');
  }

  // Resolve each tab's panel from data-controls, wiring ARIA in both directions.
  const panels = tabs.map((tab) => {
    const controls = tab.dataset.controls;
    // Resolve by id (no CSS.escape needed, and works outside a browser too),
    // then confirm the panel actually lives inside this tabs container.
    const candidate = controls ? root.ownerDocument.getElementById(controls) : null;
    const panel = candidate && root.contains(candidate) ? (candidate as HTMLElement) : null;
    if (!panel) {
      throw new Error(`createTabs: no panel found for tab with data-controls="${controls ?? ''}".`);
    }
    const tabId = tab.id || (tab.id = nextId('tab'));
    panel.id = controls as string;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.setAttribute('tabindex', '0'); // Panel itself is focusable for SR users.
    return panel;
  });

  list.setAttribute('role', 'tablist');
  if (orientation === 'vertical') {
    list.setAttribute('aria-orientation', 'vertical');
  }

  let selected = clampIndex(options.selectedIndex ?? 0, tabs.length);

  /** Apply selection state to DOM: aria-selected, roving tabindex, panel visibility. */
  function render(): void {
    tabs.forEach((tab, i) => {
      const isSelected = i === selected;
      tab.setAttribute('aria-selected', String(isSelected));
      // Roving tabindex: only the selected tab is in the tab order.
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
      panels[i]!.hidden = !isSelected;
    });
  }

  /** Select a tab, move focus to it, and re-render. */
  function select(index: number, focus = false): void {
    selected = clampIndex(index, tabs.length);
    render();
    if (focus) {
      tabs[selected]!.focus();
    }
  }

  const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
  const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

  function onKeydown(event: KeyboardEvent): void {
    let handled = true;
    switch (event.key) {
      case nextKey:
        select((selected + 1) % tabs.length, true);
        break;
      case prevKey:
        select((selected - 1 + tabs.length) % tabs.length, true);
        break;
      case 'Home':
        select(0, true);
        break;
      case 'End':
        select(tabs.length - 1, true);
        break;
      default:
        handled = false;
    }
    if (handled) {
      // Prevent the arrow keys from also scrolling the page.
      event.preventDefault();
    }
  }

  const clickHandlers = tabs.map((tab, i) => {
    const handler = (): void => select(i, true);
    tab.addEventListener('click', handler);
    return handler;
  });
  list.addEventListener('keydown', onKeydown);

  render();

  return {
    select: (index: number) => select(index, false),
    get selectedIndex() {
      return selected;
    },
    destroy(): void {
      list.removeEventListener('keydown', onKeydown);
      tabs.forEach((tab, i) => tab.removeEventListener('click', clickHandlers[i]!));
    },
  };
}

/** Clamp an index into [0, length). */
function clampIndex(index: number, length: number): number {
  if (Number.isNaN(index) || index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
}
