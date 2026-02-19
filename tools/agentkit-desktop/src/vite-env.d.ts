/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __APP_DESCRIPTION__: string;

declare module "*.svg" {
  const content: string;
  export default content;
}
