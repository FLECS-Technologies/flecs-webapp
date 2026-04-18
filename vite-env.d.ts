/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module '*.json?url' {
  const value: string;
  export default value;
}
