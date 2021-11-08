import * as React from "react";
import Box from "@mui/material/Box";
import MarketplaceList from "../components/MarketplaceList";
import { appData } from "../data/MarketplaceData";

export default function Marketplace() {
  return (
    <Box sx={{ mt: 10, mr: 5 }} aria-label="Marketplace-Page">
      <MarketplaceList appData={appData} />
    </Box>
  );
}
