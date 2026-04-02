// Theme tokens are now in Tailwind CSS (src/index.css @theme block).
// This file is kept for backward compatibility with any direct imports.
import './fonts.css';
import { brand } from './tokens';

export { brand };

// Stub exports for any remaining references
export const darkTheme = {};
export const lightTheme = {};
