import { describe, it, expect, beforeEach } from 'vitest';
import { createTabs } from '../src/tabs.js';

/** Build the canonical tabs markup and return the root element. */
function mount(): HTMLElement {
  document.body.innerHTML = `
    <div data-tabs>
      <div data-tablist aria-label="Sections">
        <button data-tab data-controls="p1">One</button>
        <button data-tab data-controls="p2">Two</button>
        <button data-tab data-controls="p3">Three</button>
      </div>
      <div id="p1" data-tabpanel>First</div>
      <div id="p2" data-tabpanel>Second</div>
      <div id="p3" data-tabpanel>Third</div>
    </div>`;
  return document.querySelector<HTMLElement>('[data-tabs]')!;
}

function tabs(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-tab]'));
}
function panels(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-tabpanel]'));
}
function key(el: Element, k: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
}

describe('createTabs — ARIA wiring', () => {
  beforeEach(() => mount());

  it('assigns roles and links tabs to panels both ways', () => {
    createTabs(document.querySelector<HTMLElement>('[data-tabs]')!);
    const [t1] = tabs();
    const [p1] = panels();

    expect(document.querySelector('[data-tablist]')!.getAttribute('role')).toBe('tablist');
    expect(t1!.getAttribute('role')).toBe('tab');
    expect(t1!.getAttribute('aria-controls')).toBe(p1!.id);
    expect(p1!.getAttribute('role')).toBe('tabpanel');
    expect(p1!.getAttribute('aria-labelledby')).toBe(t1!.id);
  });

  it('selects the first tab and hides the rest by default', () => {
    createTabs(document.querySelector<HTMLElement>('[data-tabs]')!);
    const [t1, t2] = tabs();
    const [p1, p2] = panels();

    expect(t1!.getAttribute('aria-selected')).toBe('true');
    expect(t2!.getAttribute('aria-selected')).toBe('false');
    expect(p1!.hidden).toBe(false);
    expect(p2!.hidden).toBe(true);
  });

  it('uses a roving tabindex so the tablist is a single tab stop', () => {
    createTabs(document.querySelector<HTMLElement>('[data-tabs]')!);
    const [t1, t2, t3] = tabs();
    expect(t1!.getAttribute('tabindex')).toBe('0');
    expect(t2!.getAttribute('tabindex')).toBe('-1');
    expect(t3!.getAttribute('tabindex')).toBe('-1');
  });
});

describe('createTabs — keyboard navigation (WAI-ARIA)', () => {
  beforeEach(() => mount());

  it('ArrowRight moves selection and focus to the next tab', () => {
    createTabs(document.querySelector<HTMLElement>('[data-tabs]')!);
    const [t1, t2] = tabs();
    key(document.querySelector('[data-tablist]')!, 'ArrowRight');

    expect(t2!.getAttribute('aria-selected')).toBe('true');
    expect(t2!.getAttribute('tabindex')).toBe('0');
    expect(t1!.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(t2);
  });

  it('ArrowLeft wraps from the first tab to the last', () => {
    createTabs(document.querySelector<HTMLElement>('[data-tabs]')!);
    const t = tabs();
    key(document.querySelector('[data-tablist]')!, 'ArrowLeft');
    expect(t[2]!.getAttribute('aria-selected')).toBe('true');
  });

  it('Home and End jump to the first and last tab', () => {
    createTabs(document.querySelector<HTMLElement>('[data-tabs]')!);
    const t = tabs();
    const list = document.querySelector('[data-tablist]')!;
    key(list, 'End');
    expect(t[2]!.getAttribute('aria-selected')).toBe('true');
    key(list, 'Home');
    expect(t[0]!.getAttribute('aria-selected')).toBe('true');
  });

  it('vertical orientation responds to ArrowDown/ArrowUp', () => {
    createTabs(document.querySelector<HTMLElement>('[data-tabs]')!, { orientation: 'vertical' });
    const t = tabs();
    const list = document.querySelector('[data-tablist]')!;
    expect(list.getAttribute('aria-orientation')).toBe('vertical');
    key(list, 'ArrowDown');
    expect(t[1]!.getAttribute('aria-selected')).toBe('true');
  });
});

describe('createTabs — interaction & lifecycle', () => {
  beforeEach(() => mount());

  it('clicking a tab selects it', () => {
    createTabs(document.querySelector<HTMLElement>('[data-tabs]')!);
    const [, t2] = tabs();
    t2!.click();
    expect(t2!.getAttribute('aria-selected')).toBe('true');
  });

  it('destroy() removes listeners', () => {
    const instance = createTabs(document.querySelector<HTMLElement>('[data-tabs]')!);
    instance.destroy();
    const [, t2] = tabs();
    t2!.click();
    // After destroy, clicking no longer changes selection.
    expect(t2!.getAttribute('aria-selected')).toBe('false');
  });

  it('throws on malformed markup (missing panel)', () => {
    document.body.innerHTML = `<div data-tabs><div data-tablist><button data-tab data-controls="nope">X</button></div></div>`;
    expect(() => createTabs(document.querySelector<HTMLElement>('[data-tabs]')!)).toThrow();
  });
});
