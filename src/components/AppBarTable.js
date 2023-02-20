import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import ClearIcon from '@mui/icons-material/Clear'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'

export default function BasicTable (jobs, deleteJobs, clearAllFinishedJobs, clearAllButtonisDisabled) {
  const rows = jobs?.sort((a, b) => b.id - a.id).map(j => ({ id: j.id, description: j.description, status: j.status }))

  return (
    <React.Fragment>
      <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            justifyContent: 'space-between'
          }}
        >
          <Typography
            variant="h12"
            id="tableTitle"
            component="div"
          >
            Installation Log
          </Typography>
          <Tooltip title={'Clear the log (this does not uninstall or remove any apps or instances)'}>
            <div>
            <Button variant='outlined' sx={{ mr: 1 }} disabled={clearAllButtonisDisabled} data-testid='clear-all-button' onClick={() => clearAllFinishedJobs()}>
              Clear All
            </Button>
            </div>
          </Tooltip>
      </Toolbar>
      <TableContainer>
        <Table size='small' aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell align="left" sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="left" sx={{ fontWeight: 'bold' }}>Clear</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align="left">{row.description}</TableCell>
                <TableCell align="left">{row.status}</TableCell>
                <TableCell align="left">{row.status !== 'running' ? <ClearIcon fontSize='10' onClick={() => deleteJobs(row.id)}></ClearIcon> : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  )
}
