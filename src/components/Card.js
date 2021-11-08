import { React, useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

function installApp(props) {}

function uninstallApp(props) {}

export default function OutlinedCard(props) {
  const [installed, setInstalled] = useState(props.status === "installed");
  const [uninstalled, setUninstalled] = useState(
    props.status === "uninstalled"
  );
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
        <Button size="small">Details</Button>
        <Button size="small" disabled={installed} onClick={installApp(props)}>
          Install
        </Button>
        <Button
          size="small"
          disabled={uninstalled}
          color="error"
          onClick={uninstallApp(props)}
        >
          Uninstall
        </Button>
      </CardActions>
    </Card>
  );
}
