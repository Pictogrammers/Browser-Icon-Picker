
export interface Icon {
  id: string,
  name: string,
  author: string,
  codepoint: string,
  keywords1: string,
  keywords2: string,
  version: string,
  family: 'default'|'light',
}

// requestIdleCallback
// @see https://github.com/microsoft/TypeScript/issues/21309#issuecomment-376338415
declare global {
  interface Window {
    requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions | undefined) => number;
    cancelIdleCallback: (handle: number) => void,
  }
}
