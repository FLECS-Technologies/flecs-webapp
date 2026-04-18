/**
 * Regression test for commit 6f77811 — row identity survives deletion.
 *
 * Pre-fix, EnvironmentConfigTab keyed its rows by array index, so deleting
 * row 0 caused React to reuse the mounted input DOM for row 1 — user saw
 * row 0's typed values appear in row 1. The stable `_rowId` (crypto.randomUUID)
 * fixes this by keying on row identity instead.
 *
 * This assertion can't be done cleanly in Playwright (sensitive to TanStack
 * background refetches under parallel load). React Testing Library is the
 * right tool for component-state-identity invariants.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EnvironmentConfigTab from './EnvironmentConfigTab';

// Mock the orval-generated hooks used by the component — no network in unit tests.
// STABLE references matter: the component's useEffect dep is [envResponse]; if
// we returned a fresh object per call, the effect would re-fire every render
// and setEnvVars/setSavedSnapshot would loop to OOM.
vi.mock('@generated/core/instances/instances', () => {
  const stableEnvResponse = { data: [] as unknown[], status: 200 };
  return {
    useGetInstancesInstanceIdConfigEnvironment: () => ({
      data: stableEnvResponse,
      isLoading: false,
    }),
    usePutInstancesInstanceIdConfigEnvironment: () => ({ mutateAsync: vi.fn() }),
    useDeleteInstancesInstanceIdConfigEnvironmentVariableName: () => ({ mutateAsync: vi.fn() }),
  };
});

function renderWithClient(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('EnvironmentConfigTab — row identity', () => {
  beforeEach(() => {
    // crypto.randomUUID is present in node 20 jsdom but let's be explicit.
    if (!globalThis.crypto?.randomUUID) {
      globalThis.crypto = { randomUUID: () => Math.random().toString(36).slice(2) } as Crypto;
    }
  });

  it('deleting row 0 preserves row 1 inputs (no identity bleed)', async () => {
    const onChange = vi.fn();
    renderWithClient(<EnvironmentConfigTab instanceId="42" onChange={onChange} />);

    // Initial state has no rows and an empty-state "Add" button.
    const addBtn = screen.getByRole('button', { name: /add environment variable/i });
    fireEvent.click(addBtn);

    // First row now rendered — fill A=1.
    const names1 = screen.getAllByPlaceholderText('VARIABLE_NAME');
    const values1 = screen.getAllByPlaceholderText('value');
    expect(names1).toHaveLength(1);
    fireEvent.change(names1[0], { target: { value: 'A' } });
    fireEvent.change(values1[0], { target: { value: '1' } });

    // Second add — fill B=2.
    fireEvent.click(screen.getByRole('button', { name: /add environment variable/i }));
    const names2 = screen.getAllByPlaceholderText('VARIABLE_NAME');
    const values2 = screen.getAllByPlaceholderText('value');
    expect(names2).toHaveLength(2);
    fireEvent.change(names2[1], { target: { value: 'B' } });
    fireEvent.change(values2[1], { target: { value: '2' } });

    // Delete row 0.
    const deleteButtons = screen.getAllByRole('button', { name: /delete environment variable/i });
    fireEvent.click(deleteButtons[0]);

    // Remaining row must be B=2 — the regression case would show A=1.
    await waitFor(() => {
      const namesAfter = screen.getAllByPlaceholderText('VARIABLE_NAME');
      expect(namesAfter).toHaveLength(1);
      expect((namesAfter[0] as HTMLInputElement).value).toBe('B');
    });
    const valuesAfter = screen.getAllByPlaceholderText('value');
    expect((valuesAfter[0] as HTMLInputElement).value).toBe('2');
  });
});
