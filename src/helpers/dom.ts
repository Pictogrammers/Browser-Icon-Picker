/**
 * MaterialDesignIcons-Picker
 */

/**
 * @see https://stackoverflow.com/a/13382873/1474079
 */
const getScrollbarWidth = (): number => {
  // Creating invisible container
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll'; // forcing scrollbar to appear
  document.body.appendChild(outer);

  // Creating inner element and placing it in the container
  const inner = document.createElement('div');
  outer.appendChild(inner);

  // Calculating difference between container's full width and the child width
  const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

  // Removing temporary elements from the DOM
  (outer.parentNode as Node).removeChild(outer);

  return scrollbarWidth;
}

export { getScrollbarWidth };
