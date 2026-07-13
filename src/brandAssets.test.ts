import { describe, expect, it } from 'vitest';
import { themingAssetPath } from './brandAssets';

describe('themingAssetPath', () => {
  it('resolves white-label assets under theming/ against the runtime base path', () => {
    expect(themingAssetPath('config.json')).toBe('/theming/config.json');
  });
});
