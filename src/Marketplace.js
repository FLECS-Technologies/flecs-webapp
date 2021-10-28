import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CODESYSIcon from "./img/Codesys_Logo.svg.png";

export default function BasicCard() {
  return (
    <Box sx={{ mt: 10, mr: 5 }}>
      <Grid
        container
        spacing={2}
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        <Card sx={{ minWidth: 300, m: 1 }}>
          <CardHeader
            avatar={
              <Avatar alt="CODESYS" src={CODESYSIcon} variant="rounded" />
            }
          ></CardHeader>
          <CardContent>
            <Typography
              sx={{ fontSize: 14 }}
              color="text.secondary"
              gutterBottom
            >
              CODESYS GmbH
            </Typography>
            <Typography variant="h5" component="div">
              CODESYS Control
            </Typography>
            <Typography
              sx={{ fontSize: 14, mt: 1 }}
              color="text.secondary"
              gutterBottom
            >
              Version 4.3.0
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Details</Button>
            <Button size="small">Install</Button>
          </CardActions>
        </Card>
        <Card sx={{ minWidth: 300, m: 1 }}>
          <CardHeader
            avatar={
              <Avatar alt="CODESYS" src={CODESYSIcon} variant="rounded" />
            }
          ></CardHeader>
          <CardContent>
            <Typography
              sx={{ fontSize: 14 }}
              color="text.secondary"
              gutterBottom
            >
              CODESYS GmbH
            </Typography>
            <Typography variant="h5" component="div">
              CODESYS Edge Gateway
            </Typography>
            <Typography
              sx={{ fontSize: 14, mt: 1 }}
              color="text.secondary"
              gutterBottom
            >
              Version 4.3.0
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Details</Button>
            <Button size="small">Install</Button>
          </CardActions>
        </Card>
      </Grid>
    </Box>
  );
}
