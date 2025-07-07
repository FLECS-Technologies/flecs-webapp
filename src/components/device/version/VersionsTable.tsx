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
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { CoreVersion, Distro, Kernel } from './VersionInterfaces';

interface VersionsTableProps {
  coreVersion?: CoreVersion;
  webappVersion?: string;
  distro?: Distro;
  kernel?: Kernel;
}
interface VersionData {
  component: string;
  version?: string;
}

const VersionsTable: React.FC<VersionsTableProps> = ({
  coreVersion = {},
  webappVersion = 'N/A',
  distro = { name: 'Distro', version: 'N/A' },
  kernel = { version: 'N/A' },
}) => {
  function createData(component: string, version?: string): VersionData {
    return { component, version };
  }

  const versions = React.useMemo(
    () => [
      createData('Core', coreVersion?.core),
      createData('API', coreVersion?.api),
      createData('UI', webappVersion),
      createData(distro?.name || 'Distro', distro?.version),
      createData('Kernel', kernel?.version),
    ],
    [coreVersion, webappVersion, distro, kernel],
  );

  return (
    <Table data-testid="versions-table" size="small" aria-label="versions-table">
      <TableHead>
        <TableRow key="versions-table-head">
          <TableCell colSpan={2}>
            <Typography variant="h6">Versions</Typography>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {versions.map(({ component, version }) => (
          <TableRow key={`${component}-${version}`} style={{ borderBottom: 'none' }}>
            <TableCell style={{ borderBottom: 'none' }}>{component}</TableCell>
            <TableCell style={{ borderBottom: 'none' }}>{version || 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default VersionsTable;
