/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextValue {
  isDarkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useDarkMode = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a ThemeHandler');
  }
  return context;
};

const getSystemDarkMode = (): boolean => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

interface ThemeHandlerProps {
  children: React.ReactNode;
}

export const ThemeHandler: React.FC<ThemeHandlerProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('preferred-theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return getSystemDarkMode();
  });

  const setDarkMode = (darkMode: boolean): void => {
    setIsDarkMode(darkMode);
    localStorage.setItem('preferred-theme', darkMode ? 'dark' : 'light');
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent): void => {
      const saved = localStorage.getItem('preferred-theme');
      if (!saved) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// For backward compatibility
export const DarkModeState = ThemeHandler;

// Legacy context export for backward compatibility
export const darkModeContext = ThemeContext;
