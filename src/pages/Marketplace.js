import {useContext, React} from "react";
import Box from "@mui/material/Box";
import MarketplaceList from "../components/MarketplaceList";
//import { appData } from "../data/MarketplaceData";

import { ReferenceDataContext } from "../data/ReferenceDataContext"

export default function Marketplace() {
  const { appList } = useContext(ReferenceDataContext);

  return (
    <Box sx={{ mt: 5, mr: 10, ml: 32 }} aria-label="Marketplace-Page">
      <MarketplaceList appData={appList} />
    </Box>
  );
}
