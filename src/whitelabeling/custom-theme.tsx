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
import { createTheme, ThemeOptions } from '@mui/material/styles';
import './custom-fonts.css';
import { darkTheme as flecsDarkTheme, lightTheme as flecsLightTheme } from '../styles/theme';

const darkTheme = createTheme({
  ...flecsDarkTheme,
} as ThemeOptions);

const lightTheme = createTheme({
  ...flecsLightTheme,
} as ThemeOptions);

export { darkTheme, lightTheme };
