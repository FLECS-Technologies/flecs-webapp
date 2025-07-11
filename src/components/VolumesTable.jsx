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
import PropTypes from 'prop-types';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

export default function VolumesTable(props) {
  const { volumes } = props;
  return (
    <Table data-testid="details-table" size="small" aria-label="instances-details">
      <TableHead>
        <TableRow>
          <TableCell data-testid="table-header-name">Name</TableCell>
          <TableCell data-testid="table-header-path">Path</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {volumes &&
          volumes?.map((volume) => (
            <TableRow key={volume.name} style={{ borderBottom: 'none' }}>
              <TableCell style={{ borderBottom: 'none' }}>{volume.name}</TableCell>
              <TableCell style={{ borderBottom: 'none' }}>{volume.path}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

VolumesTable.propTypes = {
  volumes: PropTypes.array,
};
