/// <reference types="electron-vite/node" />

declare module '*.html' {
  const html: string;

  export default html;
}
declare module '*.html?raw' {
  const html: string;

  export default html;
}
declare module '*.svg?inline' {
  const base64: string;

  export default base64;
}
declare module '*.svg?raw' {
  const html: string;

  export default html;
}
// AudioWorklet sources are imported as text and handed to addModule via a Blob URL:
// the renderer builds as one IIFE, so there is no stable chunk URL to point at.
declare module '*.js?raw' {
  const source: string;

  export default source;
}
declare module '*.png' {
  const element: HTMLImageElement;

  export default element;
}
declare module '*.jpg' {
  const element: HTMLImageElement;
  export default element;
}
declare module '*.css' {
  const css: string;

  export default css;
}
declare module '*.css?inline' {
  const css: string;

  export default css;
}
