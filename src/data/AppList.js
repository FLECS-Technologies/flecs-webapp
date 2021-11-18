import { useContext, useEffect, useState, React } from 'react'
import { ReferenceDataContext } from './ReferenceDataContext'
import { marketPlaceAppsList } from './MarketplaceAppsList'
import { installedAppsList } from './InstalledAppsList'
import DeviceAPI from '../api/DeviceAPI'

const AppList = () => {
  const { setAppList } = useContext(ReferenceDataContext)

  const [marketplaceAppList] = useState([...marketPlaceAppsList])
  const [installedAppList, setInstalledAppList] = useState([...installedAppsList])

  // todo: call api from the marketplace to get all apps
  //   useEffect(() => {
  //       setMarketPlaceList(marketplaceAppList => [...marketplaceAppList, ...marketPlaceAppsList]);
  //   }, []);

  // call api from the device to get all installed apps
  useEffect(() => {
    const deviceAPI = new DeviceAPI()
    if (deviceAPI.getInstalledApps()) {
      setInstalledAppList([deviceAPI.appList])
    }
  }, [])

  const mergedList = Object.values([...marketplaceAppList, ...installedAppList]
    .reduce((r, o) => {
      r[o.appId] = r[o.appId]
        ? { ...r[o.appId], instances: [...r[o.appId].instances, ...o.instances], status: o.status }
        : o

      return r
    }, {}))

  useEffect(() => {
    setAppList(appList => [...mergedList])
  }, [])
  return (<div></div>)
}

export default AppList
