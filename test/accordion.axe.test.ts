import { describe, it, expect, beforeEach } from 'vitest';
import axe from 'axe-core';
import { createAccordion } from '../src/accordion.js';

/**
 * Automated accessibility scan. Automation is a floor, not a ceiling (manual
 * keyboard + screen-reader checks live in docs/accessibility), but a clean axe
 * run guarantees no regressions on the rules it can detect. One panel is
 * expanded before scanning so both a collapsed and a revealed region are
 * evaluated.
 */
describe('createAccordion — automated accessibility', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main>
        <h1>Demo</h1>
        <div data-accordion>
          <h3><button data-accordion-button data-controls="s1">Shipping</button></h3>
          <div id="s1" data-accordion-panel>Delivered within three business days.</div>
          <h3><button data-accordion-button data-controls="s2">Returns</button></h3>
          <div id="s2" data-accordion-panel>Free returns within thirty days.</div>
        </div>
      </main>`;
    const instance = createAccordion(document.querySelector<HTMLElement>('[data-accordion]')!);
    instance.expand(0);
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
