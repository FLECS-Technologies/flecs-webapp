import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import MarketplaceList from "../components/MarketplaceList";
import { appData } from "../data/MarketplaceData";

export default function Marketplace() {
  return (
    <Box sx={{ mt: 10, mr: 5 }} aria-label="Marketplace-Page">
      <Grid
        container
        spacing={2}
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        <MarketplaceList appData={appData} />
      </Grid>
    </Box>
  );
}
