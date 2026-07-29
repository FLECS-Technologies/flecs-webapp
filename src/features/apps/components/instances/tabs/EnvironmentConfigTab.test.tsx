import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EnvironmentConfigTab from './EnvironmentConfigTab';
import type { EnvironmentDraft } from '../useInstanceConfigDraft';

const Harness = () => {
  const [rows, setRows] = useState<EnvironmentDraft[]>([]);
  return <EnvironmentConfigTab rows={rows} onChange={(update) => setRows(update)} />;
};

describe('EnvironmentConfigTab row identity', () => {
  it('preserves the second row values when the first row is deleted', async () => {
    render(<Harness />);

    const addButton = screen.getByRole('button', { name: /add variable/i });
    fireEvent.click(addButton);

    let nameInputs = screen.getAllByPlaceholderText('VARIABLE_NAME');
    let valueInputs = screen.getAllByPlaceholderText('value');
    fireEvent.change(nameInputs[0], { target: { value: 'A' } });
    fireEvent.change(valueInputs[0], { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: /add variable/i }));
    nameInputs = screen.getAllByPlaceholderText('VARIABLE_NAME');
    valueInputs = screen.getAllByPlaceholderText('value');
    fireEvent.change(nameInputs[1], { target: { value: 'B' } });
    fireEvent.change(valueInputs[1], { target: { value: '2' } });

    fireEvent.click(screen.getAllByRole('button', { name: /delete environment variable/i })[0]);

    await waitFor(() => {
      const remaining = screen.getAllByPlaceholderText('VARIABLE_NAME');
      expect(remaining).toHaveLength(1);
      expect(remaining[0]).toHaveValue('B');
    });
    expect(screen.getByPlaceholderText('value')).toHaveValue('2');
  });
});
