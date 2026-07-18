import { describe, it, expect, beforeEach } from 'vitest';
import { createAccordion } from '../src/accordion.js';

/** Build the canonical accordion markup and return the root element. */
function mount(): HTMLElement {
  document.body.innerHTML = `
    <div data-accordion>
      <h3><button data-accordion-button data-controls="s1">One</button></h3>
      <div id="s1" data-accordion-panel>First</div>
      <h3><button data-accordion-button data-controls="s2">Two</button></h3>
      <div id="s2" data-accordion-panel>Second</div>
      <h3><button data-accordion-button data-controls="s3">Three</button></h3>
      <div id="s3" data-accordion-panel>Third</div>
    </div>`;
  return document.querySelector<HTMLElement>('[data-accordion]')!;
}

function root(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-accordion]')!;
}
function buttons(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-accordion-button]'));
}
function panels(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-accordion-panel]'));
}
function key(el: Element, k: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
}

describe('createAccordion — ARIA wiring', () => {
  beforeEach(() => mount());

  it('links each header button to its panel region both ways', () => {
    createAccordion(root());
    const [b1] = buttons();
    const [p1] = panels();

    expect(b1!.getAttribute('aria-controls')).toBe(p1!.id);
    expect(b1!.getAttribute('aria-expanded')).toBe('false');
    expect(p1!.getAttribute('role')).toBe('region');
    expect(p1!.getAttribute('aria-labelledby')).toBe(b1!.id);
  });

  it('starts with every panel collapsed by default', () => {
    createAccordion(root());
    panels().forEach((p) => expect(p.hidden).toBe(true));
    buttons().forEach((b) => expect(b.getAttribute('aria-expanded')).toBe('false'));
  });

  it('honours the expanded option on init', () => {
    createAccordion(root(), { expanded: [1] });
    const [b1, b2] = buttons();
    const [p1, p2] = panels();
    expect(b2!.getAttribute('aria-expanded')).toBe('true');
    expect(p2!.hidden).toBe(false);
    expect(b1!.getAttribute('aria-expanded')).toBe('false');
    expect(p1!.hidden).toBe(true);
  });
});

describe('createAccordion — single vs multiple expand', () => {
  beforeEach(() => mount());

  it('single-expand (default): opening a panel collapses the others', () => {
    const instance = createAccordion(root());
    instance.expand(0);
    instance.expand(1);
    expect(instance.expandedIndices).toEqual([1]);
    expect(panels()[0]!.hidden).toBe(true);
    expect(panels()[1]!.hidden).toBe(false);
  });

  it('single-expand collapses more than one requested initial panel to the first', () => {
    const instance = createAccordion(root(), { expanded: [0, 2] });
    expect(instance.expandedIndices).toEqual([0]);
  });

  it('multiple: several panels can stay open at once', () => {
    const instance = createAccordion(root(), { multiple: true });
    instance.expand(0);
    instance.expand(2);
    expect(instance.expandedIndices).toEqual([0, 2]);
    expect(panels()[0]!.hidden).toBe(false);
    expect(panels()[2]!.hidden).toBe(false);
  });
});

describe('createAccordion — interaction & keyboard', () => {
  beforeEach(() => mount());

  it('clicking a header button toggles its panel', () => {
    createAccordion(root());
    const [b1] = buttons();
    b1!.click();
    expect(b1!.getAttribute('aria-expanded')).toBe('true');
    expect(panels()[0]!.hidden).toBe(false);
    b1!.click();
    expect(b1!.getAttribute('aria-expanded')).toBe('false');
    expect(panels()[0]!.hidden).toBe(true);
  });

  it('ArrowDown/ArrowUp move focus between header buttons and wrap', () => {
    createAccordion(root());
    const [b1, b2, b3] = buttons();
    b1!.focus();
    key(b1!, 'ArrowDown');
    expect(document.activeElement).toBe(b2);
    key(b2!, 'ArrowUp');
    expect(document.activeElement).toBe(b1);
    key(b1!, 'ArrowUp');
    expect(document.activeElement).toBe(b3);
  });

  it('Home and End jump to the first and last header button', () => {
    createAccordion(root());
    const [b1, , b3] = buttons();
    b1!.focus();
    key(b1!, 'End');
    expect(document.activeElement).toBe(b3);
    key(b3!, 'Home');
    expect(document.activeElement).toBe(b1);
  });
});

describe('createAccordion — programmatic control & lifecycle', () => {
  beforeEach(() => mount());

  it('expand/collapse/toggle drive state', () => {
    const instance = createAccordion(root(), { multiple: true });
    instance.expand(1);
    expect(instance.expandedIndices).toEqual([1]);
    instance.toggle(1);
    expect(instance.expandedIndices).toEqual([]);
    instance.toggle(2);
    expect(instance.expandedIndices).toEqual([2]);
    instance.collapse(2);
    expect(instance.expandedIndices).toEqual([]);
  });

  it('destroy() removes listeners', () => {
    const instance = createAccordion(root());
    instance.destroy();
    const [b1] = buttons();
    b1!.click();
    expect(b1!.getAttribute('aria-expanded')).toBe('false');
  });

  it('throws on malformed markup (missing panel)', () => {
    document.body.innerHTML = `<div data-accordion><button data-accordion-button data-controls="nope">X</button></div>`;
    expect(() => createAccordion(root())).toThrow();
  });
});
