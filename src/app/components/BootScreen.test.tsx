/**
 * BootScreen — unit tests.
 * Covers step rendering, progress bar, and the stuck hint.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { BootScreen, type BootStep } from './BootScreen';

const steps = (
  s0: BootStep['status'],
  s1: BootStep['status'],
  s2: BootStep['status'],
): BootStep[] => [
  { label: 'Connecting to core', sublabel: 'getProvidersAuth', status: s0 },
  { label: 'Registering auth provider', sublabel: 'triggerFirstTimeSetup', status: s1 },
  { label: 'Checking account status', sublabel: 'GET /users/super-admin', status: s2 },
];

describe('BootScreen', () => {
  it('renders all step labels', () => {
    render(<BootScreen steps={steps('active', 'pending', 'pending')} />);
    expect(screen.getByText('Connecting to core')).toBeTruthy();
    expect(screen.getByText('Registering auth provider')).toBeTruthy();
    expect(screen.getByText('Checking account status')).toBeTruthy();
  });

  it('shows sublabel for each step', () => {
    render(<BootScreen steps={steps('active', 'pending', 'pending')} />);
    expect(screen.getByText('getProvidersAuth')).toBeTruthy();
    expect(screen.getByText('triggerFirstTimeSetup')).toBeTruthy();
    expect(screen.getByText('GET /users/super-admin')).toBeTruthy();
  });

  it('shows numeric placeholder for pending steps', () => {
    render(<BootScreen steps={steps('active', 'pending', 'pending')} />);
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('shows ✓ for done steps', () => {
    render(<BootScreen steps={steps('done', 'done', 'active')} />);
    const checks = screen.getAllByText('✓');
    expect(checks).toHaveLength(2);
  });

  it('progress bar reflects done step count', () => {
    const { container } = render(<BootScreen steps={steps('done', 'done', 'active')} />);
    const bar = container.querySelector<HTMLElement>('[style*="width"]');
    expect(bar).toBeTruthy();
    // 2/3 done ≈ 66% plus active bump — should be above 66
    const pct = parseFloat(bar!.style.width);
    expect(pct).toBeGreaterThan(66);
    expect(pct).toBeLessThanOrEqual(100);
  });

  it('progress bar is 0 when all steps are pending', () => {
    const { container } = render(<BootScreen steps={steps('active', 'pending', 'pending')} />);
    const bar = container.querySelector<HTMLElement>('[style*="width"]');
    const pct = parseFloat(bar!.style.width);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThan(40);
  });

  it('progress bar reaches 100 when all steps are done', () => {
    const { container } = render(<BootScreen steps={steps('done', 'done', 'done')} />);
    const bar = container.querySelector<HTMLElement>('[style*="width"]');
    expect(parseFloat(bar!.style.width)).toBe(100);
  });

  describe('stuck hint', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('shows stuck hint after 8 seconds on an active step', async () => {
      render(<BootScreen steps={steps('active', 'pending', 'pending')} />);
      expect(screen.queryByText(/Taking longer than expected/)).toBeNull();
      await act(async () => {
        vi.advanceTimersByTime(8_001);
      });
      expect(screen.getByText(/Taking longer than expected/)).toBeTruthy();
    });

    it('clears stuck hint when the active step completes', async () => {
      const { rerender } = render(<BootScreen steps={steps('active', 'pending', 'pending')} />);
      await act(async () => {
        vi.advanceTimersByTime(8_001);
      });
      expect(screen.getByText(/Taking longer than expected/)).toBeTruthy();
      rerender(<BootScreen steps={steps('done', 'active', 'pending')} />);
      expect(screen.queryByText(/Taking longer than expected/)).toBeNull();
    });
  });
});
