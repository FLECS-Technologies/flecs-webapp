import { useContext, React } from 'react'
import InstalledAppsList from '../components/InstalledAppsList'
import { ReferenceDataContext } from '../data/ReferenceDataContext'
import { styled } from '@mui/styles'

const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  minHeight: '48', // if minHeight is not set to 48 (or any other value), a minHeight of 64px is used, which makes the menu move down.
  // padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}))

export default function installedApps () {
  const { appList } = useContext(ReferenceDataContext)

  return (

  <div>
    <Header/>
    <InstalledAppsList appData={appList} />
  </div>
  )
}
