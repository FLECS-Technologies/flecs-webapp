import { React, useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ConfirmDialog from "./ConfirmDialog";
import Avatar from "@mui/material/Avatar";

import PostInstallAppAPI from "../api/InstallAppAPI";
import PostCreateAppInstanceAPI from "../api/CreateAppInstanceAPI";
import PostStartAppInstanceAPI from "../api/StartAppInstanceAPI";
import PostUninstallAppAPI from "../api/UninstallAppAPI";

function installApp(props) {
  var installAPI = new PostInstallAppAPI();
  installAPI.installApp(props.appId, props.version);

  var createInstanceAPI = new PostCreateAppInstanceAPI();
  createInstanceAPI.createAppInstance(props.appId, props.version, props.title);

  var startInstanceAPI = new PostStartAppInstanceAPI();
  startInstanceAPI.startAppInstance(props.appId, "01234567");
}

function uninstallApp(props) {
  var uninstallAPI = new PostUninstallAppAPI();
  uninstallAPI.uninstallApp(props.appId, props.version);
}

function requestApp(props) {
  console.info("Request " + props.title);
}

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
      </CardActions>
    </Card>
  );
}
