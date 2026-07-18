import { describe, it, expect, beforeEach } from 'vitest';
import axe from 'axe-core';
import { createMenuButton } from '../src/menu-button.js';

/**
 * Automated accessibility scan. Automation is a floor, not a ceiling (manual
 * keyboard + screen-reader checks live in docs/accessibility), but a clean axe
 * run guarantees no regressions on the rules it can detect. The menu is opened
 * before scanning so the trigger and the revealed menu items are evaluated.
 */
describe('createMenuButton — automated accessibility', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main>
        <h1>Demo</h1>
        <div data-menu>
          <button data-menu-button>Actions</button>
          <ul data-menu-list>
            <li data-menu-item>Duplicate</li>
            <li data-menu-item>Rename</li>
            <li data-menu-item>Delete</li>
          </ul>
        </div>
      </main>`;
    const instance = createMenuButton(document.querySelector<HTMLElement>('[data-menu]')!);
    instance.open();
  });

  it('has no detectable WCAG A/AA violations', async () => {
    const results = await axe.run(document.body, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    // Surface any violation ids in the failure message for fast triage.
    const ids = results.violations.map((v) => v.id);
    expect(ids, `axe violations: ${ids.join(', ')}`).toEqual([]);
  });
});
