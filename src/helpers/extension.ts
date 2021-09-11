/**
 * MaterialDesignIcons-Picker
 */

export function getBrowserInstance(): typeof chrome {
  // eslint-disable-next-line
  return window.chrome || (window as any)['browser'];
}
