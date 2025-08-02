/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme, lightTheme } from '../whitelabeling/custom-theme';
import CssBaseline from '@mui/material/CssBaseline';

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

  // Listen for system theme changes when no preference is set
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
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

// For backward compatibility
export const DarkModeState = ThemeHandler;

// Legacy context export for backward compatibility
export const darkModeContext = ThemeContext;
