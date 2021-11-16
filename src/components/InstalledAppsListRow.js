import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import CircleIcon from "@mui/icons-material/Circle";
import ErrorIcon from "@mui/icons-material/Error";
import AddTaskIcon from "@mui/icons-material/AddTask";
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from "@mui/material/Tooltip";
import Toolbar from "@mui/material/Toolbar";
import Avatar from "@mui/material/Avatar";

export default function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'none' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Avatar src={row.avatar}></Avatar>
        </TableCell>
        <TableCell>{row.title}</TableCell>
        <TableCell>{row.vendor}</TableCell>
        <TableCell>{row.version}</TableCell>
        <TableCell>
          <Tooltip title="Start new app instance">
            <IconButton color="primary">
              <AddTaskIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Toolbar sx={{pl: { sm: 2 }, pr: { xs: 1, sm: 1 }   }}>
                <Typography sx={{ flex: "0.1 0.1 10%" }} variant="h6" gutterBottom component="div">
                  App instances
                </Typography>
                <Button startIcon={<AddTaskIcon />}>
                  start new instance
                </Button>
              </Toolbar>
              <Table size="small" aria-label="app-instances">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Instance name</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.instances.map((appInstance) => (
                    <TableRow key={appInstance.instanceId}>
                      <TableCell component="th" scope="row">
                      <Tooltip title={"App " + row.status}>
                          {appInstance.status === "started" ? (
                            <CircleIcon color="success" />
                          ) : (
                            <ErrorIcon color="warning" />
                          )}
                        </Tooltip>
                      </TableCell>
                      <TableCell>{appInstance.instancename}</TableCell>
                      <TableCell>{appInstance.version}</TableCell>
                      <TableCell>
                      <Tooltip title="Start instance">
                          <span>
                            <IconButton color="success" disabled={appInstance.status === "started"}>
                              <PlayCircleIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Stop instance">
                          <span>
                            <IconButton color="warning" disabled={appInstance.status === "stopped"}>
                              <PauseCircleFilledIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete instance">
                          <span>
                            <IconButton>
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}