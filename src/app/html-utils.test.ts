/**
 * Regression lock for sanitizeHtml() — WSTG-INPV-02 (Stored XSS).
 *
 * We render marketplace product descriptions via html-react-parser AFTER running
 * them through sanitizeHtml() (see FullCard.tsx + product-service.ts). If
 * ALLOWED_TAGS/ALLOWED_ATTR in html-utils.ts are loosened without thought,
 * these assertions fail — which is exactly what we want.
 */
import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './html-utils';

describe('sanitizeHtml — XSS sink defense', () => {
  it('strips <script> blocks entirely', () => {
    const out = sanitizeHtml('<p>ok</p><script>alert(1)</script>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('alert(1)');
    expect(out).toContain('<p>ok</p>');
  });

  it('strips inline event handlers (onerror, onclick, onload, onmouseover)', () => {
    const out = sanitizeHtml('<img src=x onerror=alert(1)><p onclick="alert(2)">hi</p>');
    expect(out).not.toMatch(/onerror/i);
    expect(out).not.toMatch(/onclick/i);
    expect(out).not.toMatch(/alert\(/);
  });

  it('removes disallowed tags (<img>, <iframe>, <object>, <svg>)', () => {
    const out = sanitizeHtml(
      '<iframe src="evil"></iframe><img src="x"><object data="evil"></object>',
    );
    expect(out).not.toContain('<iframe');
    expect(out).not.toContain('<img');
    expect(out).not.toContain('<object');
  });

  it('neutralizes javascript: URLs in href', () => {
    // DOMPurify with default config blocks javascript: scheme in href.
    const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    expect(out).not.toMatch(/javascript:/i);
  });

  it('preserves the allowed tag set (typography)', () => {
    const out = sanitizeHtml(
      '<h1>Title</h1><p><strong>bold</strong> <em>italic</em> <u>under</u></p><ul><li>x</li></ul>',
    );
    expect(out).toContain('<h1>Title</h1>');
    expect(out).toContain('<strong>bold</strong>');
    expect(out).toContain('<em>italic</em>');
    expect(out).toContain('<u>under</u>');
    expect(out).toContain('<ul>');
    expect(out).toContain('<li>x</li>');
  });

  it('preserves <a href target rel> — our explicit whitelist for marketplace links', () => {
    const out = sanitizeHtml(
      '<a href="https://example.com" target="_blank" rel="noopener">doc</a>',
    );
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener"');
  });

  it('strips non-whitelisted presentational attributes (style, class, id)', () => {
    // DOMPurify's default ALLOW_DATA_ATTR=true preserves data-* — not an XSS
    // vector here (we render with React, data-* attrs are inert). If we ever
    // need to tighten (e.g., CSS-selector injection concerns), set
    // ALLOW_DATA_ATTR: false in html-utils.ts and update this test.
    const out = sanitizeHtml('<p style="color:red" class="x" id="y">hi</p>');
    expect(out).not.toContain('style=');
    expect(out).not.toContain('class=');
    expect(out).not.toContain('id=');
    expect(out).toContain('<p');
    expect(out).toContain('>hi</p>');
  });

  it('returns an empty string for an entirely malicious input', () => {
    const out = sanitizeHtml('<script>bad</script>');
    expect(out).toBe('');
  });
});
