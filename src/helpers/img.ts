/**
 * Img helper
 */

import {Canvg} from 'canvg';

export const svgToPng = async (svg: string, size = 512): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    throw new Error();
  }
  const v = await Canvg.fromString(ctx, svg);
  await v.render();

  return await new Promise((resolve, reject) => {
    canvas.toBlob((result => result !== null ? resolve(result) : reject()), 'image/png');
  });
};
