import { describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createDisclosure } from '../src/disclosure.js';

/** Build the canonical disclosure markup and return the root element. */
function mount(): HTMLElement {
  document.body.innerHTML = `
    <div data-disclosure>
      <button data-disclosure-button data-controls="d1">Details</button>
      <div id="d1" data-disclosure-region>Hidden content</div>
    </div>`;
  return document.querySelector<HTMLElement>('[data-disclosure]')!;
}

function button(): HTMLButtonElement {
  return document.querySelector<HTMLButtonElement>('[data-disclosure-button]')!;
}
function region(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-disclosure-region]')!;
}

describe('createDisclosure — ARIA wiring', () => {
  beforeEach(() => mount());

  it('links the trigger to its region and starts collapsed', () => {
    createDisclosure(document.querySelector<HTMLElement>('[data-disclosure]')!);

    expect(button().getAttribute('aria-controls')).toBe(region().id);
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(region().hidden).toBe(true);
  });

  it('honours the expanded option on init', () => {
    createDisclosure(document.querySelector<HTMLElement>('[data-disclosure]')!, { expanded: true });

    expect(button().getAttribute('aria-expanded')).toBe('true');
    expect(region().hidden).toBe(false);
  });
});

describe('createDisclosure — interaction', () => {
  beforeEach(() => mount());

  it('clicking the trigger expands then collapses the region', () => {
    createDisclosure(document.querySelector<HTMLElement>('[data-disclosure]')!);

    button().click();
    expect(button().getAttribute('aria-expanded')).toBe('true');
    expect(region().hidden).toBe(false);

    button().click();
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(region().hidden).toBe(true);
  });

  it('is operable from the keyboard via the native button (Enter and Space)', async () => {
    createDisclosure(document.querySelector<HTMLElement>('[data-disclosure]')!);
    const user = userEvent.setup();

    button().focus();
    await user.keyboard('{Enter}');
    expect(button().getAttribute('aria-expanded')).toBe('true');

    await user.keyboard(' ');
    expect(button().getAttribute('aria-expanded')).toBe('false');
  });
});

describe('createDisclosure — programmatic control & lifecycle', () => {
  beforeEach(() => mount());

  it('toggle() flips state and toggle(boolean) forces it', () => {
    const instance = createDisclosure(document.querySelector<HTMLElement>('[data-disclosure]')!);

    instance.toggle();
    expect(instance.expanded).toBe(true);
    expect(region().hidden).toBe(false);

    instance.toggle(false);
    expect(instance.expanded).toBe(false);
    expect(region().hidden).toBe(true);

    instance.toggle(true);
    expect(instance.expanded).toBe(true);
  });

  it('destroy() removes listeners', () => {
    const instance = createDisclosure(document.querySelector<HTMLElement>('[data-disclosure]')!);
    instance.destroy();

    button().click();
    // After destroy, clicking no longer changes state.
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(region().hidden).toBe(true);
  });

  it('throws on malformed markup (missing region)', () => {
    document.body.innerHTML = `<div data-disclosure><button data-disclosure-button data-controls="nope">X</button></div>`;
    expect(() =>
      createDisclosure(document.querySelector<HTMLElement>('[data-disclosure]')!),
    ).toThrow();
  });
});
