import * as React from "react";
import Box from "@mui/material/Box";
import InstalledAppsList from "../components/InstalledAppsList"
import { appData } from "../data/DeviceAppsData.js";

export default function installedApps(){
    return(
        <Box s={{ mt: 5, mr: 10, ml: 32 }} aria-label="installed-apps-page">
            <InstalledAppsList appData={appData} />
        </Box>
    );
}