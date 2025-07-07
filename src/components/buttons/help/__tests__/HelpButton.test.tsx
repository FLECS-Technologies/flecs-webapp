/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Jun 06 2024
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
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HelpButton from '../HelpButton';

// Mock window.open
const originalOpen = window.open;
beforeAll(() => {
  window.open = jest.fn();
});
afterAll(() => {
  window.open = originalOpen;
});

describe('HelpButton', () => {
  it('renders the help button with default label', () => {
    render(<HelpButton url="https://example.com/help" />);
    const button = screen.getByRole('button', { name: /help/i });
    expect(button).toBeInTheDocument();
  });

  it('renders the help button with a custom label', () => {
    render(<HelpButton url="https://example.com/help" label="Get Help" />);
    const button = screen.getByRole('button', { name: /get help/i });
    expect(button).toBeInTheDocument();
  });

  it('opens the help URL in a new tab when clicked', async () => {
    const url = 'https://example.com/help';
    render(<HelpButton url={url} />);
    await waitFor(() => screen.getByRole('button', { name: /help/i }));
    userEvent.click(screen.getByRole('button', { name: /help/i }));
    await waitFor(() => expect(window.open).toHaveBeenCalledWith(url));
  });
});
