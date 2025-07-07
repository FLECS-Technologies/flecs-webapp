/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Wed Dec 15 2021
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
import { act } from 'react-dom/test-utils';
import { render, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileOpen from '../FileOpen';
import userEvent from '@testing-library/user-event';

describe('Test FileOpen', () => {
  const file = new File(['hello'], 'hello.yml', { type: 'application/yml' });
  function onConfirm() {}

  test('upload file', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<FileOpen onConfirm={onConfirm} />);
    });
    const input = await waitFor(() => screen.getByTestId('fileInput'));

    await user.upload(input, file);

    expect(input.files[0]).toBe(file);
    expect(input.files.item(0)).toBe(file);
    expect(input.files).toHaveLength(1);
  });

  test('upload whole file', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<FileOpen onConfirm={onConfirm} wholeFile={true} />);
    });
    const input = await waitFor(() => screen.getByTestId('fileInput'));

    await user.upload(input, file);

    expect(input.files[0]).toBe(file);
    expect(input.files.item(0)).toBe(file);
    expect(input.files).toHaveLength(1);
  });
});
