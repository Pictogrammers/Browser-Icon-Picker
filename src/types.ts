
export interface Icon {
  id: string,
  name: string,
  author: string,
  codepoint: string,
  keywords1: string,
  keywords2: string,
  version: string,
  styles: string[],
  class: string,
}

// requestIdleCallback
// @see https://github.com/microsoft/TypeScript/issues/21309#issuecomment-376338415
type RequestIdleCallbackHandle = any;
type RequestIdleCallbackOptions = {
  timeout: number;
};
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean;
  timeRemaining: (() => number);
};

declare global {
  interface Window {
    requestIdleCallback: ((
      callback: ((deadline: RequestIdleCallbackDeadline) => void),
      opts?: RequestIdleCallbackOptions,
    ) => RequestIdleCallbackHandle);
    cancelIdleCallback: ((handle: RequestIdleCallbackHandle) => void);
  }
}
