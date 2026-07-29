import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PortsConfigTab from './PortsConfigTab';
import type { PortDraft } from '../useInstanceConfigDraft';

const Harness = () => {
  const [rows, setRows] = useState<PortDraft[]>([]);
  return <PortsConfigTab rows={rows} onChange={(update) => setRows(update)} />;
};

describe('PortsConfigTab row identity', () => {
  it('preserves the second mapping values when the first mapping is deleted', async () => {
    render(<Harness />);

    const addButton = screen.getByTitle(/add a one-to-one port mapping/i);
    fireEvent.click(addButton);

    let hostInputs = screen.getAllByLabelText('Host port');
    let containerInputs = screen.getAllByLabelText('Container port');
    fireEvent.change(hostInputs[0], { target: { value: '8080' } });
    fireEvent.change(containerInputs[0], { target: { value: '80' } });

    fireEvent.click(addButton);
    hostInputs = screen.getAllByLabelText('Host port');
    containerInputs = screen.getAllByLabelText('Container port');
    fireEvent.change(hostInputs[1], { target: { value: '9090' } });
    fireEvent.change(containerInputs[1], { target: { value: '90' } });

    fireEvent.click(screen.getAllByRole('button', { name: /delete port mapping/i })[0]);

    await waitFor(() => {
      const remaining = screen.getAllByLabelText('Host port');
      expect(remaining).toHaveLength(1);
      expect(remaining[0]).toHaveValue(9090);
    });
    expect(screen.getByLabelText('Container port')).toHaveValue(90);
  });
});
