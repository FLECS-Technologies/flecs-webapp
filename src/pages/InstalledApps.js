import { useContext, React } from 'react'
import Box from '@mui/material/Box'
import InstalledAppsList from '../components/InstalledAppsList'
// import { installedAppsList } from "../data/DeviceAppsData.js";
import { ReferenceDataContext } from '../data/ReferenceDataContext'

export default function installedApps () {
  const { appList } = useContext(ReferenceDataContext)

  return (
        <Box s={{ mt: 5, mr: 10, ml: 32 }} aria-label="installed-apps-page">
            <InstalledAppsList appData={appList} />
        </Box>
  )
}
