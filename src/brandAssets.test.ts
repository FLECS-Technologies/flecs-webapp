import { describe, expect, it } from 'vitest';
import { publicAssetPath } from './brandAssets';

describe('publicAssetPath', () => {
  it('resolves brand assets against the runtime base path', () => {
    expect(publicAssetPath('config.json')).toBe('/config.json');
  });
});
