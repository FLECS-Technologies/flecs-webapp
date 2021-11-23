import { useContext, React } from 'react'
import styled from 'styled-components'
import MarketplaceList from '../components/MarketplaceList'
import { ReferenceDataContext } from '../data/ReferenceDataContext'

const Header = styled.div`
  display: 'flex';
  alignItems: 'center';
  justifyContent: 'flex-end';
  padding: 32px 32px;
`

export default function Marketplace () {
  const { appList } = useContext(ReferenceDataContext)

  return (
    <div>
      <Header aria-label='Header-Placeholder'/>
      <MarketplaceList aria-label='Marketplace-List' appData={appList} />
    </div>
  )
}
