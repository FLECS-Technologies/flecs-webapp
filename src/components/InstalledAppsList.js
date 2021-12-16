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

import React from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import TableSortLabel from '@mui/material/TableSortLabel'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import GetAppIcon from '@mui/icons-material/GetApp'
import { visuallyHidden } from '@mui/utils'
import Yaml from 'js-yaml'
import Row from './InstalledAppsListRow'
import FileOpen from './FileOpen'
import AppAPI from '../api/AppAPI'
import ActionSnackbar from './ActionSnackbar'
import { ReferenceDataContext } from '../data/ReferenceDataContext'

const headCells = [

  {
    id: 'title',
    numeric: false,
    disablePadding: false,
    label: 'App'
  },
  {
    id: 'author',
    numeric: false,
    disablePadding: false,
    label: 'Author'
  },
  {
    id: 'version',
    numeric: false,
    disablePadding: false,
    label: 'Version'
  }
]

function EnhancedTableHead (props) {
  const {
    order,
    orderBy,
    onRequestSort
  } = props
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        <TableCell/>
        <TableCell/>
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
              {orderBy === headCell.id
                ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
                  )
                : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
  )
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number
}

function descendingComparator (a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function getComparator (order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort (array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) {
      return order
    }
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}

export default function DeviceAppsList (props) {
  const { setUpdateAppList } = React.useContext(ReferenceDataContext)
  const [order, setOrder] = React.useState('asc')
  const [orderBy, setOrderBy] = React.useState('apps')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)
  const [sideLoading, setSideLoading] = React.useState(false)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarState, setSnackbarState] = React.useState({
    snackbarText: 'Info',
    snackbarErrorText: '',
    alertSeverity: 'success'
  })
  const { snackbarText, snackbarErrorText, alertSeverity } = snackbarState
  let tmpAppList = []

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOnSideloadConfirm = async (text) => {
    let snackbarText
    let alertSeverity
    try {
      setSideLoading(true)
      const doc = Yaml.load(text)
      const sideloadAPI = new AppAPI(doc)

      await sideloadAPI.sideloadApp(doc)
      if (sideloadAPI.lastAPICallSuccessfull) {
        setUpdateAppList(true)
        snackbarText = 'Successully loaded ' + sideloadAPI.app.title + '.'
        alertSeverity = 'success'
      } else {
        snackbarText = 'Failed to load ' + sideloadAPI.app.title + '.'
        alertSeverity = 'error'
      }
      setSnackbarState({
        alertSeverity: alertSeverity,
        snackbarText: snackbarText,
        snackbarErrorText: sideloadAPI.lastAPIError
      })
      setSnackbarOpen(true)
    } catch (error) {
      console.error(error)
    }
    setSideLoading(false)
  }

  if (props.appData) {
    // filter on only installed apps
    tmpAppList = props.appData.filter(app => app.status === 'installed')
    tmpAppList = stableSort(tmpAppList, getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((app) => {
        return (<Row
          key={app.app}
          row={app}
        />)
      })
  }
  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tmpAppList.length) : 0
  return (
    <Box
     // sx={{ width: '100%' /*, mt: 10, mr: 10, ml: 32 */ }}
      aria-label="installed-apps-list"
    >
      <Paper>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 }
          }}
        >
          <Typography
            sx={{ flex: '0.1 0.1 10%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Installed Apps
          </Typography>
          <Tooltip title="Install your own app on this device">
            <div>
            <FileOpen
              data-testid="sideload-app-button"
              buttonText="Sideload App"
              buttonIcon={<GetAppIcon/>}
              accept='.yml'
              // setFile={setSideloadFile}
              loading={sideLoading}
              onConfirm={handleOnSideloadConfirm}
              disabled={sideLoading}
            ></FileOpen>
            </div>
          </Tooltip>
        </Toolbar>
        <TableContainer >
          <Table aria-label="installed-apps-table">
          <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={props.length}
            />
            <TableBody>
              {tmpAppList}
              {emptyRows > 0 && (

                <TableRow>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={tmpAppList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        <ActionSnackbar
            text={snackbarText}
            errorText={snackbarErrorText}
            open={snackbarOpen}
            setOpen={setSnackbarOpen}
            alertSeverity={alertSeverity}
        />
    </Box>
  )
}

DeviceAppsList.propTypes = {
  length: PropTypes.number,
  appData: PropTypes.any
}
