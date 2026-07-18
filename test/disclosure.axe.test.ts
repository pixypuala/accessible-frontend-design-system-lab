import { describe, it, expect, beforeEach } from 'vitest';
import axe from 'axe-core';
import { createDisclosure } from '../src/disclosure.js';

/**
 * Automated accessibility scan. Automation is a floor, not a ceiling (manual
 * keyboard + screen-reader checks live in docs/accessibility), but a clean axe
 * run guarantees no regressions on the rules it can detect. The region is
 * expanded before scanning so both the trigger and the revealed content are
 * evaluated.
 */
describe('createDisclosure — automated accessibility', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main>
        <h1>Demo</h1>
        <div data-disclosure>
          <button data-disclosure-button data-controls="d1">Shipping details</button>
          <div id="d1" data-disclosure-region>Delivered within three business days.</div>
        </div>
      </main>`;
    const instance = createDisclosure(document.querySelector<HTMLElement>('[data-disclosure]')!);
    instance.toggle(true);
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
