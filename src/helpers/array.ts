/**
 * MaterialDesignIcons-Picker
 * Array utils
 */

/**
 * Splits the specified array by chunks of specified size.
 * Each chunk will contain n objects with 2 keys:
 *  - id, built by concatenating the "id" attribute of each chunk item
 *  - items: the chunk items.
 */
function objectChunk<T extends {id: string}>(array: Array<T>, size: number): Array<{id: string, items: Array<T>}> {
  const chunks = [];
  let i = 0;
  const n = array.length;

  while (i < n) {
    const items = array.slice(i, i += size);
    chunks.push({
      id: items.map(item => item.id).join(','),
      items,
    });
  }

  return chunks;
}

/**
 * Returns the intersection between two arrays.
 */
function intersect<T>(array1: Array<T>, array2: Array<T>): Array<T> {
  return array1.filter((n) => array2.includes(n));
}

export {objectChunk, intersect};
