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

import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';
let SET_THEME;

export const darkModeContext = createContext();

export const darkModeReducer = (state, action) => {
  switch (action.type) {
    case SET_THEME:
      return {
        ...state,
        darkMode: action.payload,
      };
    default:
      return state;
  }
};

export const DarkModeState = (props) => {
  const initialState = {
    darkMode: 'false',
  };
  const [state, dispatch] = useReducer(darkModeReducer, initialState);

  const setDarkMode = async (bool) => {
    dispatch({
      type: SET_THEME,
      payload: bool,
    });
  };

  return (
    <darkModeContext.Provider
      value={{
        darkMode: state.darkMode,
        setDarkMode,
      }}
    >
      {props.children}
    </darkModeContext.Provider>
  );
};

DarkModeState.propTypes = {
  children: PropTypes.any,
};
