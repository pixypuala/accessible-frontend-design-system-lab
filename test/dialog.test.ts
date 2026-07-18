import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createDialog } from '../src/dialog.js';

/**
 * Build the canonical dialog markup: a trigger and background content that must
 * be inerted while the modal is open, plus the dialog itself.
 */
function mount(): HTMLElement {
  document.body.innerHTML = `
    <div id="page">
      <button id="opener">Open</button>
      <a href="#somewhere">Background link</a>
    </div>
    <div data-dialog aria-labelledby="dlg-title" hidden>
      <h2 id="dlg-title">Confirm deletion</h2>
      <button data-dialog-close>Cancel</button>
      <button id="confirm">Delete</button>
    </div>`;
  return document.querySelector<HTMLElement>('[data-dialog]')!;
}

function dialog(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-dialog]')!;
}
function opener(): HTMLButtonElement {
  return document.querySelector<HTMLButtonElement>('#opener')!;
}
function key(el: Element, k: string, init: KeyboardEventInit = {}): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, ...init }));
}

describe('createDialog — ARIA wiring', () => {
  beforeEach(() => mount());

  it('marks the element as a modal dialog and keeps it hidden until opened', () => {
    createDialog(dialog());
    expect(dialog().getAttribute('role')).toBe('dialog');
    expect(dialog().getAttribute('aria-modal')).toBe('true');
    expect(dialog().getAttribute('tabindex')).toBe('-1');
    expect(dialog().hidden).toBe(true);
  });
});

describe('createDialog — open behaviour', () => {
  beforeEach(() => mount());

  it('open() reveals the dialog and moves focus inside it', () => {
    const instance = createDialog(dialog());
    opener().focus();
    instance.open();
    expect(instance.isOpen).toBe(true);
    expect(dialog().hidden).toBe(false);
    expect(document.activeElement).toBe(document.querySelector('[data-dialog-close]'));
  });

  it('honours an explicit initialFocus selector', () => {
    const instance = createDialog(dialog(), { initialFocus: '#confirm' });
    instance.open();
    expect(document.activeElement).toBe(document.querySelector('#confirm'));
  });

  it('inerts background content while open and restores it on close', () => {
    const instance = createDialog(dialog());
    const page = document.querySelector<HTMLElement>('#page')!;
    instance.open();
    expect(page.hasAttribute('inert')).toBe(true);
    expect(dialog().hasAttribute('inert')).toBe(false);
    instance.close();
    expect(page.hasAttribute('inert')).toBe(false);
  });
});

describe('createDialog — focus trap & close', () => {
  beforeEach(() => mount());

  it('Tab from the last focusable wraps to the first', () => {
    const instance = createDialog(dialog());
    instance.open();
    const confirm = document.querySelector<HTMLElement>('#confirm')!;
    confirm.focus();
    key(confirm, 'Tab');
    expect(document.activeElement).toBe(document.querySelector('[data-dialog-close]'));
  });

  it('Shift+Tab from the first focusable wraps to the last', () => {
    const instance = createDialog(dialog());
    instance.open();
    const cancel = document.querySelector<HTMLElement>('[data-dialog-close]')!;
    cancel.focus();
    key(cancel, 'Tab', { shiftKey: true });
    expect(document.activeElement).toBe(document.querySelector('#confirm'));
  });

  it('Escape closes the dialog and returns focus to the opener', () => {
    const instance = createDialog(dialog());
    opener().focus();
    instance.open();
    key(dialog(), 'Escape');
    expect(instance.isOpen).toBe(false);
    expect(dialog().hidden).toBe(true);
    expect(document.activeElement).toBe(opener());
  });

  it('a [data-dialog-close] control closes the dialog', () => {
    const onClose = vi.fn();
    const instance = createDialog(dialog(), { onClose });
    opener().focus();
    instance.open();
    document.querySelector<HTMLElement>('[data-dialog-close]')!.click();
    expect(instance.isOpen).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(opener());
  });
});

describe('createDialog — lifecycle', () => {
  beforeEach(() => mount());

  it('destroy() removes the close listener and any lingering inert', () => {
    const instance = createDialog(dialog());
    instance.open();
    instance.destroy();
    const page = document.querySelector<HTMLElement>('#page')!;
    expect(page.hasAttribute('inert')).toBe(false);
    document.querySelector<HTMLElement>('[data-dialog-close]')!.click();
    // After destroy the close control no longer toggles state.
    expect(dialog().hidden).toBe(false);
  });
});
