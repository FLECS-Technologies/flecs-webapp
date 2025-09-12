import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { MarketplaceUser } from '../../models/marketplace';

interface MarketplaceUserContextType {
  user: MarketplaceUser | null;
  setUser: React.Dispatch<React.SetStateAction<MarketplaceUser | null>>;
  userChanged: boolean;
  authHeaderUseBearer: () => Record<string, string>;
  authorizationHeaderUseBearer: () => Record<string, string>;
  authHeaderUseXAccess: () => Record<string, string>;
  jwt: () => string;
}

export const MarketplaceUserContext = createContext<MarketplaceUserContextType | undefined>(
  undefined,
);

type Props = {
  children: React.ReactNode;
};

export const MarketplaceUserProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<MarketplaceUser | null>(null);

  // Track the previous user to detect when user changes (login/logout events)
  const prevUserRef = useRef(user);
  const userChanged = prevUserRef.current !== user;
  useEffect(() => {
    prevUserRef.current = user;
  });

  // Authentication helper functions
  const authHeaderUseBearer = (): Record<string, string> => {
    if (user && user.jwt && user.jwt.token) {
      return { Authentication: 'Bearer ' + user.jwt.token };
    } else {
      return {};
    }
  };

  const authorizationHeaderUseBearer = (): Record<string, string> => {
    if (user && user.jwt && user.jwt.token) {
      return { Authorization: 'Bearer ' + user.jwt.token };
    } else {
      return {};
    }
  };

  const authHeaderUseXAccess = (): Record<string, string> => {
    if (user && user.jwt && user.jwt.token) {
      // for Node.js Express back-end
      return { 'x-access-token': user.jwt.token };
    } else {
      return {};
    }
  };

  const jwt = (): string => {
    if (user && user.jwt && user.jwt.token) {
      return user.jwt.token;
    } else {
      return '';
    }
  };

  return (
    <MarketplaceUserContext.Provider
      value={{
        user,
        setUser,
        userChanged,
        authHeaderUseBearer,
        authorizationHeaderUseBearer,
        authHeaderUseXAccess,
        jwt,
      }}
    >
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
