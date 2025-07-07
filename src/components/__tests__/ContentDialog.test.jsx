/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Mon Dec 20 2021
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
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContentDialog from '../ContentDialog';
import { Button } from '@mui/material';

describe('Content Dialog', () => {
  let open = true;
  let testButtonCalled = false;
  function setOpen() {
    open = !open;
  }
  function handleTestButton() {
    testButtonCalled = true;
  }
  test('renders content dialog component', () => {
    const { getByTestId } = render(
      <ContentDialog open={open} title={'Test Dialog'} setOpen={setOpen} actions={null} />,
    );

    const closeButton = getByTestId('close-button');
    const diagTitle = getByTestId('content-dialog-title');

    expect(diagTitle).toHaveTextContent('Test Dialog');

    fireEvent.click(closeButton);

    expect(open).toBeFalsy();
  });

  test('renders content dialog with custom actions', () => {
    open = true;
    const { getByTestId } = render(
      <ContentDialog
        open={open}
        title={'Test Dialog'}
        content={null}
        setOpen={setOpen}
        actions={
          <Button data-testid="test-button" onClick={handleTestButton}>
            Test
          </Button>
        }
      />,
    );

    const testButton = getByTestId('test-button');
    const diagTitle = getByTestId('content-dialog-title');

    expect(diagTitle).toHaveTextContent('Test Dialog');

    fireEvent.click(testButton);
    expect(testButtonCalled).toBeTruthy();

    expect(() => getByTestId('close-button')).toThrow();
  });
});
