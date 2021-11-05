import React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function OutlinedCard(props) {
  return (
    <Card sx={{ minWidth: 300, m: 1 }}>
      <CardHeader>
        <Avatar src={props.avatar} />
      </CardHeader>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {props.vendor}
        </Typography>
        <Typography variant="h5" component="div">
          {props.title}
        </Typography>
        <Typography
          sx={{ fontSize: 14, mt: 1 }}
          color="text.secondary"
          gutterBottom
        >
          {props.version}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Details</Button>
        <Button size="small">Install</Button>
        <Button size="small">Uninstall</Button>
      </CardActions>
    </Card>
  );
}
