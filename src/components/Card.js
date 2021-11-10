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

function installApp(props) {
  var installAPI = new PostInstallAppAPI();
  var returnStatus = installAPI.installApp(props.appId, props.version);
}

function uninstallApp(props) {}

export default function OutlinedCard(props) {
  const [installed, setInstalled] = useState(props.status === "installed");
  const [uninstalled, setUninstalled] = useState(
    props.status === "uninstalled"
  );
  const [open, setConfirmOpen] = useState(false);
  const [snOpen, setSNOpen] = useState(false);

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
        <Button size="small" aria-label="app-details-button">
          Details
        </Button>
        <Button
          size="small"
          aria-label="install-app-button"
          disabled={installed}
          onClick={installApp(props)}
        >
          Install
        </Button>
        <Button
          size="small"
          aria-label="uninstall-app-button"
          disabled={uninstalled}
          color="error"
          onClick={() => setConfirmOpen(true)}
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
      </CardActions>
    </Card>
  );
}
