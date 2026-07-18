import { describe, it, expect, beforeEach } from 'vitest';
import axe from 'axe-core';
import { createTabs } from '../src/tabs.js';

/**
 * Automated accessibility scan. Automation is a floor, not a ceiling (manual
 * keyboard + screen-reader checks live in docs/accessibility), but a clean axe
 * run guarantees no regressions on the rules it can detect.
 */
describe('createTabs — automated accessibility', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main>
        <h1>Demo</h1>
        <div data-tabs>
          <div data-tablist aria-label="Sections">
            <button data-tab data-controls="p1">One</button>
            <button data-tab data-controls="p2">Two</button>
          </div>
          <div id="p1" data-tabpanel>First panel</div>
          <div id="p2" data-tabpanel>Second panel</div>
        </div>
      </main>`;
    createTabs(document.querySelector<HTMLElement>('[data-tabs]')!);
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
