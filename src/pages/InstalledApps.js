import { useContext, React } from 'react'
import InstalledAppsList from '../components/InstalledAppsList'
import { ReferenceDataContext } from '../data/ReferenceDataContext'
import styled from 'styled-components'

const Header = styled.div`
  display: 'flex';
  alignItems: 'center';
  justifyContent: 'flex-end';
  padding: 32px 32px;
`

export default function installedApps () {
  const { appList } = useContext(ReferenceDataContext)

  return (

  <div>
    <Header aria-label='Header-Placeholder'/>
    <InstalledAppsList appData={appList} />
  </div>
  )
}
