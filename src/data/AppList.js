import { useContext, useEffect, useState, React } from 'react'
import { ReferenceDataContext } from './ReferenceDataContext'
import { marketPlaceAppsList } from './MarketplaceAppsList'
import { installedAppsList } from './InstalledAppsList'
import DeviceAPI from '../api/DeviceAPI'

function AppList () {
  const { setAppList } = useContext(ReferenceDataContext)

  const [marketplaceAppList] = useState([...marketPlaceAppsList])
  const [installedAppList, setInstalledAppList] = useState([...installedAppsList])
  let mergedList = []

  // todo: call api from the marketplace to get all apps
  //   useEffect(() => {
  //       setMarketPlaceList(marketplaceAppList => [...marketplaceAppList, ...marketPlaceAppsList]);
  //   }, []);

  // call api from the device to get all installed apps
  useEffect(async () => {
    const deviceAPI = new DeviceAPI()
    const response = await fetch(deviceAPI.getInstalledApps()).then(response => response.json)
    if (response.ok) {
      setInstalledAppList([deviceAPI.appList])
    }
  }, [])
  mergedList = Object.values([...marketplaceAppList, ...installedAppList]
    .reduce((r, o) => {
      r[o.app] = r[o.app]
        ? { ...r[o.app], instances: [...r[o.app].instances, ...o.instances], status: o.status }
        : o

      return r
    }, {}))
  useEffect(() => {
    setAppList(appList => [...mergedList])
  }, [])
  return (<div></div>)
}

export default AppList
