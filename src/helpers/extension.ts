/**
 * MaterialDesignIcons-Picker
 */

export function getBrowserInstance(): typeof chrome|null {
  // eslint-disable-next-line
  return window.chrome || (window as any)['browser'];
}
