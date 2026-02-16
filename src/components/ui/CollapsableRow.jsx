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

import { Collapse, IconButton, TableCell, TableRow } from '@mui/material';
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export default function CollapsableRow(props) {
  const { title, children } = props;
  const [open, setOpen] = React.useState(false);
  return (
    <Fragment>
      <TableRow>
        <TableCell data-testid="expand-cell" style={{ borderBottom: 'none' }}>
          <IconButton
            data-testid="expand-button"
            aria-label="expand row"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
          {title}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          data-testid="instances-cell"
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={6}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            {children}
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

CollapsableRow.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
};
