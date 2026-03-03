/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jun 01 2022
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
import { render, screen } from '@testing-library/react';
import VersionsTable from '../VersionsTable';

const mockCoreVersion = {
  core: '1.2.0-porpoise-ABCDE',
  api: '2.0.0',
};

describe('VersionsTable', () => {
  test('renders VersionsTable component', async () => {
    render(<VersionsTable coreVersion={mockCoreVersion} webappVersion={'1.2.0-porpoise'} />);

    expect(await screen.findByText('Versions')).toBeVisible();
    expect(screen.getByText('Core')).toBeVisible();
    expect(screen.getByText('API')).toBeVisible();
    expect(screen.getByText('UI')).toBeVisible();
    expect(screen.getByText('1.2.0-porpoise')).toBeVisible();
    expect(screen.getByText('1.2.0-porpoise-ABCDE')).toBeVisible();
    expect(screen.getByText('SBOM')).toBeVisible();
  });
});
