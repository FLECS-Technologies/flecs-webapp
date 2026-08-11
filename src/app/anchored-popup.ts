import type { CSSProperties } from 'react';

export type PopupPlacement = 'above' | 'below';

interface AnchoredPopupOptions {
  anchor: Pick<DOMRect, 'top' | 'right' | 'bottom'>;
  popupHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  placement?: PopupPlacement;
  top?: number;
  margin?: number;
  gap?: number;
}

export function positionAnchoredPopup({
  anchor,
  popupHeight,
  viewportWidth,
  viewportHeight,
  placement,
  top,
  margin = 8,
  gap = 4,
}: AnchoredPopupOptions): { placement: PopupPlacement; style: CSSProperties } {
  const spaceBelow = viewportHeight - anchor.bottom - margin;
  const spaceAbove = anchor.top - margin;
  const resolvedPlacement =
    placement ?? (popupHeight > spaceBelow && spaceAbove > spaceBelow ? 'above' : 'below');
  const resolvedTop =
    top ??
    (resolvedPlacement === 'above'
      ? Math.max(margin, anchor.top - gap - popupHeight)
      : anchor.bottom + gap);
  const availableHeight =
    resolvedPlacement === 'above'
      ? anchor.top - gap - resolvedTop
      : viewportHeight - resolvedTop - margin;

  return {
    placement: resolvedPlacement,
    style: {
      position: 'fixed',
      right: viewportWidth - anchor.right,
      maxHeight: Math.max(availableHeight, 0),
      overflowY: 'auto',
      top: resolvedTop,
    },
  };
}
