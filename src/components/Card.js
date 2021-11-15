import { React, useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import ConfirmDialog from "./ConfirmDialog";
import AppAPI from "../api/AppAPI";

export default function OutlinedCard(props) {
  const [installed, setInstalled] = useState(props.status === "installed");
  const [uninstalled, setUninstalled] = useState(
    props.status === "uninstalled"
  );
  const [available, setUnavailable] = useState(
    props.availability === "available"
  );
  var displayStateRequest = available ? "none" : "block";
  var displayState = available ? "block" : "none";

  const [open, setConfirmOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    snackbarOpen: false,
    snackbarText: "Info",
    alertSeverity: "success"
  });

  const { alertSeverity, snackbarText, snackbarOpen } = snackbarState;

  function installApp(props) {
    var appAPI = new AppAPI(props);

    var success = appAPI.installFromMarketplace();
    
    var alertSeverity = success ? "success" : "error";
    var snackbarText;
    
    if (success) {
      setInstalled(true);
      setUninstalled(false);
      snackbarText = props.title + " successfully installed.";
    } else {
      snackbarText = "Failed to install " + props.title + ".";
    }

    setSnackbarState({
      snackbarOpen: true,
      alertSeverity: alertSeverity,
      snackbarText: snackbarText
    });
  }

  function uninstallApp(props) {
    
    var appAPI = new AppAPI(props);
    
    var success = appAPI.uninstall();
    
    var alertSeverity = success ? "success" : "error";
    var snackbarText;
    
    if(success){
      setInstalled(false);
      setUninstalled(true);
      snackbarText = props.title + " successfully uninstalled.";
    }
    else{
      snackbarText = "Failed to uninstall " + props.title + ".";
    }

    setSnackbarState({
      snackbarOpen: true,
      alertSeverity: alertSeverity,
      snackbarText: snackbarText
    });
  }

  function requestApp(props) {

    var success = true; // call send e-mail api
    
    var alertSeverity = success ? "success" : "error";
    var snackbarText = "Successfully requested " + props.title + " as a new app from " + props.vendor + ".";

    console.info("Request " + props.title);

    setSnackbarState({
      snackbarOpen: true,
      alertSeverity: alertSeverity,
      snackbarText: snackbarText
    });
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarState({
      snackbarOpen: false,
      snackbarText: snackbarText,
      alertSeverity: alertSeverity
    });
  };

  return (
    <Card sx={{ minWidth: 300, maxWidth: 300, m: 1 }}>
      <CardHeader
        avatar={<Avatar src={props.avatar} />}
        title={props.title}
        subheader={props.vendor}
      ></CardHeader>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Version {props.version}
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.primary" gutterBottom>
          {props.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          aria-label="app-request-button"
          color="info"
          disabled={available}
          onClick={() => setRequestOpen(true)}
          style={{ display: displayStateRequest }}
        >
          Request
        </Button>
        <Button
          size="small"
          aria-label="install-app-button"
          disabled={installed}
          onClick={() => installApp(props)}
          style={{ display: displayState }}
        >
          Install
        </Button>
        <Button
          size="small"
          aria-label="uninstall-app-button"
          disabled={uninstalled}
          color="error"
          onClick={() => setConfirmOpen(true)}
          style={{ display: displayState }}
        >
          Uninstall
        </Button>
        <ConfirmDialog
          title={"Uninstall " + props.title + "?"}
          open={open}
          setOpen={setConfirmOpen}
          onConfirm={() => uninstallApp(props)}
        >
          Are you sure you want to uninstall {props.title}?
        </ConfirmDialog>
        <ConfirmDialog
          title={"Send request for " + props.title + " app?"}
          open={requestOpen}
          setOpen={setRequestOpen}
          onConfirm={() => requestApp(props)}
        >
          Are you sure you want to send us a request for a {props.title} app
          from {props.vendor}?
        </ConfirmDialog>
        <Snackbar
          anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={alertSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarText}
          </Alert>
        </Snackbar>
      </CardActions>
    </Card>
  );
}
