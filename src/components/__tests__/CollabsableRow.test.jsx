/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Apr 07 2022
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
import { act } from 'react-dom/test-utils';
import { render, screen, fireEvent } from '@testing-library/react';
import CollapsableRow from '../CollapsableRow';
import { Table, Typography } from '@mui/material';

describe('CollabsableRow', () => {
  test('renders CollabsableRow component', async () => {
    await act(async () => {
      render(
        <Table>
          <CollapsableRow title="Test Title"></CollapsableRow>
        </Table>,
      );
    });
    expect(screen.getByText('Test Title')).toBeVisible();
  });

  test('click expand button', async () => {
    await act(async () => {
      render(
        <Table>
          <CollapsableRow title="Test Title">
            <Typography>This is inside</Typography>
          </CollapsableRow>
        </Table>,
      );
    });
    const expandButton = screen.getByTestId('expand-button');

    await act(async () => {
      fireEvent.click(expandButton);
    });
    expect(screen.getByText('Test Title')).toBeVisible();
    expect(screen.getByText('This is inside')).toBeVisible();
  });
});
