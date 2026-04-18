/**
 * Regression test for commit da0a679 — port mapping row identity survives
 * deletion. Same pattern as EnvironmentConfigTab.test.tsx.
 *
 * Pre-fix, PortsConfigTab keyed its rows by array index. Deleting row 0 caused
 * React to reuse the mounted input DOM for row 1 — user saw row 0's typed
 * ports appear in row 1. The stable `_rowId` (crypto.randomUUID) fixes this.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PortsConfigTab from './PortsConfigTab';

// Stable reference — see EnvironmentConfigTab.test for the OOM gotcha.
vi.mock('@generated/core/instances/instances', () => {
  const stablePortsResponse = { data: { tcp: [], udp: [] }, status: 200 };
  return {
    useGetInstancesInstanceIdConfigPorts: () => ({
      data: stablePortsResponse,
      isLoading: false,
    }),
    usePutInstancesInstanceIdConfigPortsTransportProtocol: () => ({ mutateAsync: vi.fn() }),
  };
});

function renderWithClient(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('PortsConfigTab — row identity', () => {
  it('deleting row 0 preserves row 1 port values (no identity bleed)', async () => {
    renderWithClient(<PortsConfigTab instanceId="42" onChange={vi.fn()} />);

    // Add first row via the "one-to-one" button (identified by title attr).
    const addButton = screen.getByTitle(/add a one-to-one port mapping/i);
    fireEvent.click(addButton);

    // Fill row 0: host 8080 → container 80.
    let hostInputs = screen.getAllByPlaceholderText(/host port/i);
    let containerInputs = screen.getAllByPlaceholderText(/container port/i);
    expect(hostInputs).toHaveLength(1);
    fireEvent.change(hostInputs[0], { target: { value: '8080' } });
    fireEvent.change(containerInputs[0], { target: { value: '80' } });

    // Add second row.
    fireEvent.click(addButton);
    hostInputs = screen.getAllByPlaceholderText(/host port/i);
    containerInputs = screen.getAllByPlaceholderText(/container port/i);
    expect(hostInputs).toHaveLength(2);
    fireEvent.change(hostInputs[1], { target: { value: '9090' } });
    fireEvent.change(containerInputs[1], { target: { value: '90' } });

    // Delete row 0.
    const deleteButtons = screen.getAllByTitle(/delete port mapping/i);
    fireEvent.click(deleteButtons[0]);

    // Regression assertion: one row remains with row 1's values (9090/90),
    // not row 0's (8080/80).
    await waitFor(() => {
      const remaining = screen.getAllByPlaceholderText(/host port/i);
      expect(remaining).toHaveLength(1);
      expect((remaining[0] as HTMLInputElement).value).toBe('9090');
    });
    const containerAfter = screen.getAllByPlaceholderText(/container port/i);
    expect((containerAfter[0] as HTMLInputElement).value).toBe('90');
  });
});
