import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import ClearIcon from '@mui/icons-material/Clear'
import { Button } from '@mui/material'

export default function BasicTable (filteredJobs, hideJobs, cleanAllFilteredJobsCompleted) {
  const rows = filteredJobs?.map(j => ({ id: j.id, description: j.description, status: j.status }))

  return (
    <React.Fragment>
      <Button style={{ float: 'right', fontWeight: 'bold' }} variant='outlined' sx={{ mr: 1 }} data-testid='clear-all-button' onClick={() => cleanAllFilteredJobsCompleted()}>
      Clear All
      </Button>
      <TableContainer>
        <Table size='small' aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell align="right">Description</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Clear</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.id}
                </TableCell>
                <TableCell align="right">{row.description}</TableCell>
                <TableCell align="right">{row.status}</TableCell>
                <TableCell align="right">{row.status !== 'running' ? <ClearIcon fontSize='10' onClick={() => hideJobs(row.id)}></ClearIcon> : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  )
}
