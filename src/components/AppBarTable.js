import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import DownloadIcon from '@mui/icons-material/Download'
import DeleteIcon from '@mui/icons-material/Delete'
import ClearIcon from '@mui/icons-material/Clear'
import LoadIconButton from './LoadIconButton'
import { Grid } from '@mui/material'
import { downloadPastExport, deleteExport, getExports } from '../api/device/ExportAppsService'

export default function BasicTable (jobs, deleteJobs, clearAllFinishedJobs, clearAllButtonisDisabled) {
  const rows = jobs?.sort((a, b) => b.id - a.id).map(j => ({ id: j.id, description: j.description, status: j.status, message: j.result.message }))
  const [exports, setExports] = React.useState([])

  React.useEffect(() => {
    fetchExports()
  }, [])

  const fetchExports = async () => {
    const exports = await getExports()
    setExports(exports)
  }

  const handleDownloadPastExport = async (exportId) => {
    if (exports.includes(exportId)) {
      await downloadPastExport(exportId)
    }
  }

  const handleDeleteExport = async (exportId) => {
    if (exports.includes(exportId)) {
      const answer = await deleteExport(exportId)
      if (answer.status === 200) {
        await fetchExports()
      }
    }
  }

  const checkExport = (exportId) => {
    return exports.includes(exportId)
  }

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
              <TableCell align="left" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align="left">{row.description}</TableCell>
                <TableCell align="left">{row.status}</TableCell>
                <TableCell align="left">
                  <Grid container direction="row" justify="flex-start" alignItems="flex-start">
                    <LoadIconButton disabled={row.status === 'running'} onClick={() => deleteJobs(row.id)} icon={
                      <Tooltip title={'Clear this entry from the log'}>
                        <ClearIcon aria-label='clear-button' sx={{ width: '60%', cursor: 'pointer' }} />
                      </Tooltip>
                    }/>
                    {(row.description === 'Creating export' && row.status === 'successful')
                      ? <>
                          <LoadIconButton title={'Download this export'} disabled={!checkExport(row.message)} onClick={() => handleDownloadPastExport(row.message)} icon={
                          <Tooltip title={'Download this export'}>
                            <DownloadIcon aria-label='download-button' sx={{ cursor: 'pointer' }} />
                          </Tooltip>
                          }/>
                          <LoadIconButton disabled={!checkExport(row.message)} onClick={() => handleDeleteExport(row.message)} icon={
                            <Tooltip title={'Delete this export'}>
                              <DeleteIcon aria-label='delete-button' sx={{ cursor: 'pointer' }} />
                            </Tooltip>
                          }/>
                        </>
                      : null}
                  </Grid>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  )
}
