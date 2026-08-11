import { describe, expect, it } from 'vitest';
import { positionAnchoredPopup } from './anchored-popup';

const anchor = { top: 500, right: 620, bottom: 532 };

describe('positionAnchoredPopup', () => {
  it('opens a tall popup above when it has more room there', () => {
    const result = positionAnchoredPopup({
      anchor,
      popupHeight: 360,
      viewportWidth: 640,
      viewportHeight: 700,
    });

    expect(result.placement).toBe('above');
    expect(result.style).toMatchObject({ right: 20, top: 136, maxHeight: 360 });
  });

  it('keeps a nested popup on its parent placement', () => {
    const result = positionAnchoredPopup({
      anchor,
      popupHeight: 140,
      viewportWidth: 640,
      viewportHeight: 700,
      placement: 'above',
      top: 136,
    });

    expect(result.placement).toBe('above');
    expect(result.style.top).toBe(136);
    expect(result.style.maxHeight).toBe(360);
  });
});
