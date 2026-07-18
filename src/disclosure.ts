/**
 * Accessible Disclosure — an implementation of the WAI-ARIA Disclosure pattern.
 *
 * Framework-agnostic on purpose: it progressively enhances semantic markup, so
 * it works in a WordPress block, a plain page, or any framework. A disclosure is
 * a single trigger button that shows or hides one region. It manages the two
 * things keyboard and screen-reader users depend on:
 *   - `aria-expanded` on the trigger + `aria-controls` pointing at the region,
 *   - the region's `hidden` state kept in lock-step with `aria-expanded`.
 *
 * The trigger is a native `<button>`, so Enter and Space activation come from
 * the platform — no synthetic key handling that could drift from browser
 * behaviour.
 *
 * Expected markup (region id optional — generated if absent):
 *   <div data-disclosure>
 *     <button data-disclosure-button data-controls="d1">Details</button>
 *     <div id="d1" data-disclosure-region>…</div>
 *   </div>
 */

export interface DisclosureOptions {
  /** Whether the region is expanded on init. Defaults to false (collapsed). */
  expanded?: boolean;
}

export interface DisclosureInstance {
  /** Set the expanded state; omit the argument to flip the current state. */
  toggle(expanded?: boolean): void;
  /** Whether the region is currently expanded. */
  readonly expanded: boolean;
  /** Remove listeners and ARIA wiring. */
  destroy(): void;
}

/**
 * Enhance a container into an accessible disclosure widget.
 *
 * @param root    The `[data-disclosure]` container.
 * @param options Behavioural options.
 * @returns A handle to control or tear down the widget.
 * @throws If the required trigger/region structure is missing.
 */
export function createDisclosure(
  root: HTMLElement,
  options: DisclosureOptions = {},
): DisclosureInstance {
  const button = root.querySelector<HTMLElement>('[data-disclosure-button]');
  if (!button) {
    throw new Error('createDisclosure: missing [data-disclosure-button] element.');
  }

  // Resolve the region from data-controls, then confirm it lives inside this
  // container (resolve by id so it works outside a browser too).
  const controls = button.dataset.controls;
  const candidate = controls ? root.ownerDocument.getElementById(controls) : null;
  const region = candidate && root.contains(candidate) ? (candidate as HTMLElement) : null;
  if (!region) {
    throw new Error(
      `createDisclosure: no region found for button with data-controls="${controls ?? ''}".`,
    );
  }

  region.id = controls as string;
  button.setAttribute('aria-controls', region.id);

  let expanded = options.expanded ?? false;

  /** Apply state to DOM: aria-expanded on the trigger, hidden on the region. */
  function render(): void {
    button!.setAttribute('aria-expanded', String(expanded));
    region!.hidden = !expanded;
  }

  /** Set expanded state (default flips it) and re-render. */
  function toggle(next = !expanded): void {
    expanded = next;
    render();
  }

  const onClick = (): void => toggle();
  button.addEventListener('click', onClick);

  render();

  return {
    toggle: (next?: boolean) => toggle(next),
    get expanded() {
      return expanded;
    },
    destroy(): void {
      button.removeEventListener('click', onClick);
    },
  };
}
