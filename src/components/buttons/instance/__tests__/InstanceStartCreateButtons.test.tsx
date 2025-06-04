/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Jun 16 2025
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InstanceStartCreateButtons } from '../InstanceStartCreateButtons';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const mockStart = jest.fn();
const mockCreate = jest.fn();

const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

const defaultProps = {
  app: {
    multiInstance: true,
    instances: [],
  },
  startNewInstanceCallback: mockStart,
  createNewInstanceCallback: mockCreate,
  loading: false,
  uninstalling: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('InstanceStartCreateButtons', () => {
  test('renders both buttons and default action', () => {
    renderWithTheme(<InstanceStartCreateButtons {...defaultProps} />);
    expect(screen.getByLabelText('execute-action')).toBeInTheDocument();
    expect(screen.getByLabelText('select-action')).toBeInTheDocument();
    expect(screen.getByText(/Create & start new instance/i)).toBeInTheDocument();
  });

  test('disables button when app has instance and multiInstance is false', () => {
    renderWithTheme(
      <InstanceStartCreateButtons
        {...defaultProps}
        app={{ instances: [{}], multiInstance: false }}
      />
    );
    expect(screen.getByLabelText('execute-action')).toBeDisabled();
  });

  test('disables button when loading is true', () => {
    renderWithTheme(
      <InstanceStartCreateButtons {...defaultProps} loading={true} />
    );
    expect(screen.getByLabelText('execute-action')).toBeDisabled();
  });

  test('disables button when uninstalling is true', () => {
    renderWithTheme(
      <InstanceStartCreateButtons {...defaultProps} uninstalling={true} />
    );
    expect(screen.getByLabelText('execute-action')).toBeDisabled();
  });

  test('executes the default action (StartAndCreate)', () => {
    renderWithTheme(<InstanceStartCreateButtons {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('execute-action'));
    expect(mockStart).toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  test('opens dropdown and switches action to Create', async () => {
    renderWithTheme(<InstanceStartCreateButtons {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('select-action'));

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeVisible();
    });

    fireEvent.click(screen.getByText('Create'));

    expect(screen.getByText('Create new instance')).toBeInTheDocument();

    // Execute new selected action
    fireEvent.click(screen.getByLabelText('execute-action'));
    expect(mockCreate).toHaveBeenCalled();
    expect(mockStart).not.toHaveBeenCalled();
  });

  test('tooltip message changes when disabled due to single instance limit', async () => {
    renderWithTheme(
      <InstanceStartCreateButtons
        {...defaultProps}
        app={{ instances: [{}], multiInstance: false }}
      />
    );

    const button = screen.getByLabelText('execute-action');
    fireEvent.mouseOver(button);
    await waitFor(() => {
      expect(screen.getByText(/App can only have one instance/i)).toBeInTheDocument();
    });
  });

  test('tooltip shows loading message when loading is true', async () => {
    renderWithTheme(<InstanceStartCreateButtons {...defaultProps} loading={true} />);

    const button = screen.getByLabelText('execute-action');
    fireEvent.mouseOver(button);
    await waitFor(() => {
      expect(screen.getByText(/current action is complete/i)).toBeInTheDocument();
    });
  });
});
