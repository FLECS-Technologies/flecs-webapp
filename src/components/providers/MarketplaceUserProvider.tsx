import React, { createContext, useContext, useState } from 'react';
import { MarketplaceUser } from '../../models/marketplace';

interface MarketplaceUserContextType {
  user: MarketplaceUser | null;
  setUser: React.Dispatch<React.SetStateAction<MarketplaceUser | null>>;
}

export const MarketplaceUserContext = createContext<MarketplaceUserContextType | undefined>(undefined);


type Props = {
  children: React.ReactNode;
};

export const MarketplaceUserProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<MarketplaceUser | null>(null);
  return (
    <MarketplaceUserContext.Provider value={{ user, setUser }}>
      {children}
    </MarketplaceUserContext.Provider>
  );
};

export const useMarketplaceUser = () => {
  const context = useContext(MarketplaceUserContext);
  if (!context) {
    throw new Error('useMarketplaceUser must be used within a MarketplaceUserProvider');
  }
  return context;
};
