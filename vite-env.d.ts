/// <reference types="vite/client" />

declare module '*.json?url' {
  const value: string;
  export default value;
}
