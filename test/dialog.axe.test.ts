import { describe, it, expect, beforeEach } from 'vitest';
import axe from 'axe-core';
import { createDialog } from '../src/dialog.js';

/**
 * Automated accessibility scan. Automation is a floor, not a ceiling (manual
 * keyboard + screen-reader checks live in docs/accessibility), but a clean axe
 * run guarantees no regressions on the rules it can detect. The dialog is opened
 * before scanning so the modal, its label, and its controls are evaluated while
 * the background is inert.
 */
describe('createDialog — automated accessibility', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main>
        <h1>Demo</h1>
        <button id="opener">Delete item</button>
      </main>
      <div data-dialog aria-labelledby="dlg-title" hidden>
        <h2 id="dlg-title">Confirm deletion</h2>
        <p>This action cannot be undone.</p>
        <button data-dialog-close>Cancel</button>
        <button id="confirm">Delete</button>
      </div>`;
    const instance = createDialog(document.querySelector<HTMLElement>('[data-dialog]')!);
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
