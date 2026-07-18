/**
 * Accessible Accordion — an implementation of the WAI-ARIA Accordion pattern.
 *
 * Framework-agnostic on purpose: it progressively enhances semantic markup, so
 * it works in a WordPress block, a plain page, or any framework. An accordion is
 * a set of headers, each owning a collapsible panel. It manages the things
 * keyboard and screen-reader users depend on:
 *   - each header button carries `aria-expanded` + `aria-controls`,
 *   - each panel is a `role="region"` labelled by its header button, with its
 *     `hidden` state kept in lock-step with the button's `aria-expanded`,
 *   - Down/Up/Home/End move focus between header buttons (the buttons stay in
 *     the normal Tab order — accordions do not use a roving tabindex).
 *
 * The headers are native `<button>`s, so Enter and Space activation come from
 * the platform — no synthetic key handling that could drift from the browser.
 *
 * Expected markup (panel ids required via data-controls; button ids generated
 * if absent):
 *   <div data-accordion>
 *     <h3><button data-accordion-button data-controls="s1">Section one</button></h3>
 *     <div id="s1" data-accordion-panel>…</div>
 *     <h3><button data-accordion-button data-controls="s2">Section two</button></h3>
 *     <div id="s2" data-accordion-panel>…</div>
 *   </div>
 */

export interface AccordionOptions {
  /**
   * Allow more than one panel to be open at once. When false (the default),
   * expanding a panel collapses any other open panel (single-expand).
   */
  multiple?: boolean;
  /** Indices of panels expanded on init. Defaults to none (all collapsed). */
  expanded?: readonly number[];
}

export interface AccordionInstance {
  /** Expand the panel at `index`; in single-expand mode this collapses others. */
  expand(index: number): void;
  /** Collapse the panel at `index`. */
  collapse(index: number): void;
  /** Flip the panel at `index`. */
  toggle(index: number): void;
  /** Indices of the currently expanded panels, in ascending order. */
  readonly expandedIndices: readonly number[];
  /** Remove listeners and ARIA wiring. */
  destroy(): void;
}

let uid = 0;
const nextId = (prefix: string): string => `${prefix}-${(uid += 1)}`;

/**
 * Enhance a container into an accessible accordion widget.
 *
 * @param root    The `[data-accordion]` container.
 * @param options Behavioural options.
 * @returns A handle to control or tear down the widget.
 * @throws If the required header/panel structure is missing.
 */
export function createAccordion(
  root: HTMLElement,
  options: AccordionOptions = {},
): AccordionInstance {
  const multiple = options.multiple ?? false;

  const buttons = Array.from(root.querySelectorAll<HTMLElement>('[data-accordion-button]'));
  if (buttons.length === 0) {
    throw new Error('createAccordion: no [data-accordion-button] elements found.');
  }

  // Resolve each header's panel from data-controls, wiring ARIA in both
  // directions. Resolve by id (works outside a browser too), then confirm the
  // panel actually lives inside this accordion container.
  const panels = buttons.map((button) => {
    const controls = button.dataset.controls;
    const candidate = controls ? root.ownerDocument.getElementById(controls) : null;
    const panel = candidate && root.contains(candidate) ? candidate : null;
    if (!panel) {
      throw new Error(
        `createAccordion: no panel found for button with data-controls="${controls ?? ''}".`,
      );
    }
    const buttonId = button.id || (button.id = nextId('accordion-button'));
    panel.id = controls as string;
    button.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', buttonId);
    return panel;
  });

  const expandedState = buttons.map((_, i) => (options.expanded ?? []).includes(i));
  // In single-expand mode, keep only the first requested panel open.
  if (!multiple) {
    let seen = false;
    for (let i = 0; i < expandedState.length; i += 1) {
      if (expandedState[i]) {
        if (seen) expandedState[i] = false;
        seen = true;
      }
    }
  }

  /** Apply state to DOM: aria-expanded on each button, hidden on each panel. */
  function render(): void {
    buttons.forEach((button, i) => {
      button.setAttribute('aria-expanded', String(expandedState[i]));
      panels[i]!.hidden = !expandedState[i];
    });
  }

  function setExpanded(index: number, next: boolean): void {
    if (index < 0 || index >= buttons.length) return;
    if (next && !multiple) {
      expandedState.forEach((_, i) => {
        expandedState[i] = i === index;
      });
    } else {
      expandedState[index] = next;
    }
    render();
  }

  function focusButton(index: number): void {
    const target = buttons[(index + buttons.length) % buttons.length];
    target!.focus();
  }

  function onKeydown(event: KeyboardEvent): void {
    const current = buttons.indexOf(event.target as HTMLElement);
    if (current === -1) return; // Key came from inside a panel, not a header.
    let handled = true;
    switch (event.key) {
      case 'ArrowDown':
        focusButton(current + 1);
        break;
      case 'ArrowUp':
        focusButton(current - 1);
        break;
      case 'Home':
        focusButton(0);
        break;
      case 'End':
        focusButton(buttons.length - 1);
        break;
      default:
        handled = false;
    }
    if (handled) {
      // Prevent the arrow keys from also scrolling the page.
      event.preventDefault();
    }
  }

  const clickHandlers = buttons.map((button, i) => {
    const handler = (): void => setExpanded(i, !expandedState[i]);
    button.addEventListener('click', handler);
    return handler;
  });
  root.addEventListener('keydown', onKeydown);

  render();

  return {
    expand: (index: number) => setExpanded(index, true),
    collapse: (index: number) => setExpanded(index, false),
    toggle: (index: number) => setExpanded(index, !expandedState[index]),
    get expandedIndices() {
      return expandedState.flatMap((on, i) => (on ? [i] : []));
    },
    destroy(): void {
      root.removeEventListener('keydown', onKeydown);
      buttons.forEach((button, i) => button.removeEventListener('click', clickHandlers[i]!));
    },
  };
}
