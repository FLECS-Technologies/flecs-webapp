/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
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
import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import { visuallyHidden } from '@mui/utils';
import Yaml from 'js-yaml';
import Row from './InstalledAppsListRow';
import FileOpen from './FileOpen';
import { ReferenceDataContext } from '../data/ReferenceDataContext';
import useStateWithLocalStorage from './LocalStorage';
import usePagination from '../hooks/usePagination';
import { CircularProgress } from '@mui/material';
import { useSystemContext } from '../data/SystemProvider';
import ContentDialog from './ContentDialog';
import Export from './Export';
import Import from './Import';
import InstallationStepper from './apps/installation/InstallationStepper';
import PoweredBy from './navigation/PoweredBy';
import { QuestLog } from './quests/QuestLog';

const headCells = [
  {
    id: 'title',
    numeric: false,
    disablePadding: false,
    label: 'App',
  },
  {
    id: 'author',
    numeric: false,
    disablePadding: false,
    label: 'Author',
  },
  {
    id: 'version',
    numeric: false,
    disablePadding: false,
    label: 'Version',
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell />
        <TableCell />
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number,
};

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export default function DeviceAppsList(props) {
  const { appListLoading, appListError } = React.useContext(ReferenceDataContext);
  const { ping } = useSystemContext();
  const [order, setOrder] = useStateWithLocalStorage('installedApps.table.order', 'asc');
  const [orderBy, setOrderBy] = useStateWithLocalStorage('installedApps.table.orderby', 'apps');
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination(
    'installedApps',
    0,
    5,
  );

  const [yaml, setYaml] = React.useState();
  const [sideloadAppOpen, setSideloadAppOpen] = React.useState(false);
  let tmpAppList = [];
  let numberOfInstalledApps = 0;

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleOnSideloadConfirm = async (text) => {
    try {
      const doc = Yaml.load(text);
      setYaml(doc);
      setSideloadAppOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  if (props.appData) {
    // filter on only installed apps
    tmpAppList = props.appData.filter((app) => app?.status === 'installed');
    numberOfInstalledApps = tmpAppList.length;
    tmpAppList = stableSort(tmpAppList, getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((app) => {
        return <Row key={app.appKey.name + app.appKey.version} row={app} />;
      });
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tmpAppList.length) : 0;
  return (
    <Box
      // sx={{ width: '100%' /*, mt: 10, mr: 10, ml: 32 */ }}
      aria-label="installed-apps-list"
    >
      <Paper>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
          }}
        >
          <Typography sx={{ flex: '0.1 0.1 10%' }} variant="h6" id="tableTitle" component="div">
            {appListLoading && ping ? (
              <>
                Loading Apps...
                <CircularProgress align="center" size="1.1rem" sx={{ ml: 1 }} />
              </>
            ) : (
              <>Installed Apps</>
            )}
          </Typography>
          <Tooltip title={'Export all apps and their data from this device'}>
            <div>
              <Export disabled={tmpAppList?.length === 0} sx={{ ml: 1 }}></Export>
            </div>
          </Tooltip>
          <Tooltip title={'Import apps from file'}>
            <div>
              <Import sx={{ ml: 1 }}></Import>
            </div>
          </Tooltip>
          <Tooltip title="Install your own app on this device">
            <div>
              <FileOpen
                data-testid="sideload-app-button"
                sx={{ ml: 1 }}
                buttonText="Sideload App"
                buttonIcon={<DeveloperModeIcon />}
                accept=".json"
                onConfirm={handleOnSideloadConfirm}
              ></FileOpen>
            </div>
          </Tooltip>
        </Toolbar>
        <TableContainer>
          <Table aria-label="installed-apps-table">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={props.length}
            />
            <TableBody>
              {!ping && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography align="center">
                      The FLECS services are not ready. Please try again in a couple of seconds.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {tmpAppList.length === 0 && !appListLoading && !appListError && ping && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography align="center">
                      There are no apps installed on this device. Go to the&nbsp;
                      <Link to="/Marketplace">marketplace</Link>
                      &nbsp;or sideload your own app.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {appListError && ping && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography align="center">
                      Oops! Failed to load installed apps from the device...
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {tmpAppList}
              {emptyRows > 0 && (
                <TableRow>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            display: 'flex', // Flexbox layout to align items in a row
            justifyContent: 'space-between', // Space between paginator and logo
            alignItems: 'center', // Vertically align items
            width: '100%', // Ensure it takes the full width of the container
            padding: '8px', // Add some padding around the paginator and logo
          }}
        >
          <PoweredBy />
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={numberOfInstalledApps}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Paper>
      <ContentDialog open={sideloadAppOpen} setOpen={setSideloadAppOpen} title={'Sideload App'}>
        <InstallationStepper app={yaml} sideload={true} />
      </ContentDialog>
    </Box>
  );
}

DeviceAppsList.propTypes = {
  length: PropTypes.number,
  appData: PropTypes.any,
};
