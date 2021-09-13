/**
 * Array utils
 */

function arrayChunk<T>(array: Array<T>, size: number): Array<Array<T>> {
  const chunks = [] as Array<Array<T>>;
  let i = 0;
  const n = array.length;

  while (i < n) {
    chunks.push(array.slice(i, i += size));
  }

  return chunks;
}

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

export {arrayChunk, objectChunk};
