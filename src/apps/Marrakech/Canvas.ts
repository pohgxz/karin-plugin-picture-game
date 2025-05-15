import { dirPath } from '@/utils/dir';
import { createCanvas, Image } from 'canvas';

type ImgKey = keyof typeof resources;
const resources = {
  bg: 'bg.png',
  U: 'u.png',
  R: 'R.png',
  D: 'D.png',
  L: 'L.png',
  U1: '1U.png',
  R1: '1R.png',
  D1: '1D.png',
  L1: '1L.png',
  U2: '2U.png',
  R2: '2R.png',
  D2: '2D.png',
  L2: '2L.png',
  U3: '3U.png',
  R3: '3R.png',
  D3: '3D.png',
  L3: '3L.png',
  U4: '4U.png',
  R4: '4R.png',
  D4: '4D.png',
  L4: '4L.png',
} as const;
const images = new Map<ImgKey, Image>();

if (images.size === 0) {
  const imagePath = dirPath + '/resources/image/marrakech/'
  for (const key in resources) {
    const resKey = key as ImgKey;
    const img = new Image()
    img.onload = () => images.set(resKey, img)
    img.src = imagePath + resources[resKey]
  }
}

const bit = 32;
export function draw(): string {
  const bg = images.get('bg')!;
  const canvas = createCanvas(bit * 9, bit * 10);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bg, 0, 0, bit * 9, bit * 9);

  return canvas.toBuffer().toString('base64');
}