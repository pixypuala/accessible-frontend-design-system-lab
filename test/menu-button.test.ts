import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMenuButton } from '../src/menu-button.js';

/** Build the canonical menu-button markup and return the root element. */
function mount(): HTMLElement {
  document.body.innerHTML = `
    <div data-menu>
      <button data-menu-button>Actions</button>
      <ul data-menu-list>
        <li data-menu-item>Duplicate</li>
        <li data-menu-item>Rename</li>
        <li data-menu-item>Delete</li>
      </ul>
    </div>`;
  return document.querySelector<HTMLElement>('[data-menu]')!;
}

function root(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-menu]')!;
}
function button(): HTMLButtonElement {
  return document.querySelector<HTMLButtonElement>('[data-menu-button]')!;
}
function menu(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-menu-list]')!;
}
function items(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-menu-item]'));
}
function key(el: Element, k: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
}

describe('createMenuButton — ARIA wiring', () => {
  beforeEach(() => mount());

  it('wires the trigger, menu, and items with the menu-button roles', () => {
    createMenuButton(root());
    expect(button().getAttribute('aria-haspopup')).toBe('menu');
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(button().getAttribute('aria-controls')).toBe(menu().id);
    expect(menu().getAttribute('role')).toBe('menu');
    expect(menu().getAttribute('aria-labelledby')).toBe(button().id);
    items().forEach((item) => {
      expect(item.getAttribute('role')).toBe('menuitem');
      expect(item.getAttribute('tabindex')).toBe('-1');
    });
  });

  it('starts closed with the menu hidden', () => {
    createMenuButton(root());
    expect(menu().hidden).toBe(true);
  });
});

describe('createMenuButton — open/close behaviour', () => {
  beforeEach(() => mount());

  it('clicking the trigger opens the menu and focuses the first item', () => {
    createMenuButton(root());
    button().click();
    expect(button().getAttribute('aria-expanded')).toBe('true');
    expect(menu().hidden).toBe(false);
    expect(document.activeElement).toBe(items()[0]);
  });

  it('ArrowDown on the trigger opens and focuses the first item', () => {
    createMenuButton(root());
    key(button(), 'ArrowDown');
    expect(menu().hidden).toBe(false);
    expect(document.activeElement).toBe(items()[0]);
  });

  it('ArrowUp on the trigger opens and focuses the last item', () => {
    createMenuButton(root());
    key(button(), 'ArrowUp');
    expect(document.activeElement).toBe(items()[2]);
  });

  it('Escape closes the menu and returns focus to the trigger', () => {
    createMenuButton(root());
    button().click();
    key(menu(), 'Escape');
    expect(menu().hidden).toBe(true);
    expect(document.activeElement).toBe(button());
  });
});

describe('createMenuButton — roving focus & selection', () => {
  beforeEach(() => mount());

  it('ArrowDown/ArrowUp move focus between items and wrap', () => {
    createMenuButton(root());
    button().click();
    const [i1, i2, i3] = items();
    expect(document.activeElement).toBe(i1);
    key(menu(), 'ArrowDown');
    expect(document.activeElement).toBe(i2);
    key(menu(), 'ArrowUp');
    expect(document.activeElement).toBe(i1);
    key(menu(), 'ArrowUp');
    expect(document.activeElement).toBe(i3);
  });

  it('Home and End jump to the first and last item', () => {
    createMenuButton(root());
    button().click();
    const [i1, , i3] = items();
    key(menu(), 'End');
    expect(document.activeElement).toBe(i3);
    key(menu(), 'Home');
    expect(document.activeElement).toBe(i1);
  });

  it('activating an item fires onSelect and closes the menu', () => {
    const onSelect = vi.fn();
    createMenuButton(root(), { onSelect });
    button().click();
    key(menu(), 'ArrowDown'); // focus second item
    key(menu(), 'Enter');
    expect(onSelect).toHaveBeenCalledWith(items()[1], 1);
    expect(menu().hidden).toBe(true);
    expect(document.activeElement).toBe(button());
  });

  it('clicking an item fires onSelect and closes the menu', () => {
    const onSelect = vi.fn();
    createMenuButton(root(), { onSelect });
    button().click();
    items()[2]!.click();
    expect(onSelect).toHaveBeenCalledWith(items()[2], 2);
    expect(menu().hidden).toBe(true);
  });
});

describe('createMenuButton — dismissal & lifecycle', () => {
  beforeEach(() => mount());

  it('an outside click closes the menu without stealing focus', () => {
    createMenuButton(root());
    button().click();
    document.body.click();
    expect(menu().hidden).toBe(true);
  });

  it('destroy() removes listeners', () => {
    const instance = createMenuButton(root());
    instance.destroy();
    button().click();
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(menu().hidden).toBe(true);
  });

  it('throws on malformed markup (no items)', () => {
    document.body.innerHTML = `<div data-menu><button data-menu-button>X</button><ul data-menu-list></ul></div>`;
    expect(() => createMenuButton(root())).toThrow();
  });
});
