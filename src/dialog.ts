/**
 * Accessible Dialog — an implementation of the WAI-ARIA Modal Dialog pattern.
 *
 * Framework-agnostic on purpose: it progressively enhances semantic markup, so
 * it works in a WordPress block, a plain page, or any framework. It manages the
 * things keyboard and screen-reader users depend on for a modal:
 *   - `role="dialog"` + `aria-modal="true"` on the dialog element,
 *   - focus moves into the dialog on open (an explicit initial target, else the
 *     first focusable element, else the dialog itself),
 *   - a focus trap so Tab / Shift+Tab cycle within the dialog,
 *   - Escape and `[data-dialog-close]` controls close the dialog,
 *   - focus returns to the element that had it before opening,
 *   - everything outside the dialog is made `inert` while it is open, so
 *     assistive technology and pointer/keyboard focus cannot reach it.
 *
 * Expected markup (dialog starts hidden; label it via aria-labelledby/aria-label):
 *   <div data-dialog role="dialog" aria-labelledby="dlg-title" hidden>
 *     <h2 id="dlg-title">Confirm</h2>
 *     <button data-dialog-close>Cancel</button>
 *     <button>Confirm</button>
 *   </div>
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface DialogOptions {
  /**
   * Element (or a selector resolved within the dialog) to receive focus on
   * open. Falls back to the first focusable element, then the dialog itself.
   */
  initialFocus?: HTMLElement | string;
  /** Called after the dialog has closed. */
  onClose?: () => void;
}

export interface DialogInstance {
  /** Open the dialog, trap focus, and inert the background. */
  open(): void;
  /** Close the dialog and return focus to the previously focused element. */
  close(): void;
  /** Whether the dialog is currently open. */
  readonly isOpen: boolean;
  /** Remove listeners and ARIA wiring. */
  destroy(): void;
}

/**
 * Enhance an element into an accessible modal dialog.
 *
 * @param dialog  The `[data-dialog]` element (hidden until opened).
 * @param options Behavioural options.
 * @returns A handle to control or tear down the dialog.
 */
export function createDialog(dialog: HTMLElement, options: DialogOptions = {}): DialogInstance {
  const doc = dialog.ownerDocument;

  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  // Focusable fallback so the dialog can hold focus when it has no controls.
  if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
  dialog.hidden = true;

  let opened = false;
  let previouslyFocused: HTMLElement | null = null;
  const inerted: HTMLElement[] = [];

  function focusable(): HTMLElement[] {
    return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  }

  function resolveInitialFocus(): HTMLElement {
    const { initialFocus } = options;
    if (typeof initialFocus === 'string') {
      const found = dialog.querySelector<HTMLElement>(initialFocus);
      if (found) return found;
    } else if (initialFocus) {
      return initialFocus;
    }
    return focusable()[0] ?? dialog;
  }

  /** Make everything outside the dialog inert so focus/AT cannot reach it. */
  function inertBackground(): void {
    const body = doc.body;
    // Walk up to the dialog's top-level ancestor so nested dialogs still hide
    // every sibling branch of the document body.
    let branch: HTMLElement = dialog;
    while (branch.parentElement && branch.parentElement !== body) {
      branch = branch.parentElement;
    }
    Array.from(body.children).forEach((child) => {
      if (child === branch || !(child instanceof HTMLElement)) return;
      if (child.hasAttribute('inert')) return;
      child.setAttribute('inert', '');
      inerted.push(child);
    });
  }

  function restoreBackground(): void {
    inerted.forEach((el) => el.removeAttribute('inert'));
    inerted.length = 0;
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusable();
    if (items.length === 0) {
      // Nothing to cycle through: keep focus on the dialog.
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = items[0]!;
    const last = items[items.length - 1]!;
    const active = doc.activeElement;
    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const closeHandlers = Array.from(
    dialog.querySelectorAll<HTMLElement>('[data-dialog-close]'),
  ).map((control) => {
    const handler = (): void => closeDialog();
    control.addEventListener('click', handler);
    return [control, handler] as const;
  });

  function openDialog(): void {
    if (opened) return;
    previouslyFocused = doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
    opened = true;
    dialog.hidden = false;
    inertBackground();
    dialog.addEventListener('keydown', onKeydown);
    resolveInitialFocus().focus();
  }

  function closeDialog(): void {
    if (!opened) return;
    opened = false;
    dialog.hidden = true;
    dialog.removeEventListener('keydown', onKeydown);
    restoreBackground();
    previouslyFocused?.focus();
    previouslyFocused = null;
    options.onClose?.();
  }

  return {
    open: openDialog,
    close: closeDialog,
    get isOpen() {
      return opened;
    },
    destroy(): void {
      dialog.removeEventListener('keydown', onKeydown);
      restoreBackground();
      closeHandlers.forEach(([control, handler]) => control.removeEventListener('click', handler));
    },
  };
}
