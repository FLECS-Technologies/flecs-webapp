import { describe, expect, it } from 'vitest';
import { getTermsOfUseUrl, type WCProduct } from './product-service';

const product = (value: string): WCProduct => ({
  meta_data: [{ key: '_flecs_license_url', value }],
});

describe('getTermsOfUseUrl', () => {
  it('returns a valid Console license URL', () => {
    expect(getTermsOfUseUrl(product('https://example.com/terms'))).toBe(
      'https://example.com/terms',
    );
  });

  it.each(['', 'not a url', 'javascript:alert(1)'])('rejects an unsafe value: %s', (value) => {
    expect(getTermsOfUseUrl(product(value))).toBeUndefined();
  });
});
