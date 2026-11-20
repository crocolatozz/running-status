import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const OUTPUT_DIR = path.resolve(process.cwd(), 'public', 'splash');

const SPLASH_SIZES = [
  {width: 1320, height: 2868},
  {width: 1290, height: 2796},
  {width: 1206, height: 2622},
  {width: 1179, height: 2556},
  {width: 1284, height: 2778},
  {width: 1170, height: 2532},
  {width: 1242, height: 2688},
  {width: 1125, height: 2436},
  {width: 828, height: 1792},
  {width: 750, height: 1334},
];

// Background: #0f172a
const BG_R = 15;
const BG_G = 23;
const BG_B = 42;

// Pulse accent: #10b981
const FG_R = 16;
const FG_G = 185;
const FG_B = 129;

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buffer) {
  let c = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    c = (c >>> 8) ^ crcTable[(c ^ buffer[i]) & 0xff];
  }
  return (c ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function renderSplashPng(width, height) {
  const rowStride = 1 + width * 4;
  const raw = Buffer.allocUnsafe(height * rowStride);

  // Build one solid #0f172a scanline template for fast bulk copy
  const bgRow = Buffer.allocUnsafe(rowStride);
  bgRow[0] = 0;
  for (let x = 0; x < width; x += 1) {
    const offset = 1 + x * 4;
    bgRow[offset] = BG_R;
    bgRow[offset + 1] = BG_G;
    bgRow[offset + 2] = BG_B;
    bgRow[offset + 3] = 255;
  }

  for (let y = 0; y < height; y += 1) {
    bgRow.copy(raw, y * rowStride);
  }

  // Center the unified pulse waveform at ~45% of portrait screen width
  const logoSize = Math.round(width * 0.45);
  const scale = logoSize / 512;
  const originX = (width - logoSize) / 2;
  const originY = (height - logoSize) / 2;
  const strokeRadius = 19 * scale;

  const points = [
    [56, 256],
    [126, 256],
    [176, 116],
    [256, 396],
    [326, 196],
    [376, 256],
    [456, 256],
  ].map(([x, y]) => [originX + x * scale, originY + y * scale]);

  const minX = Math.max(0, Math.floor(originX + 56 * scale - strokeRadius - 2));
  const maxX = Math.min(width - 1, Math.ceil(originX + 456 * scale + strokeRadius + 2));
  const minY = Math.max(0, Math.floor(originY + 116 * scale - strokeRadius - 2));
  const maxY = Math.min(height - 1, Math.ceil(originY + 396 * scale + strokeRadius + 2));

  for (let y = minY; y <= maxY; y += 1) {
    const rowStart = y * rowStride;
    for (let x = minX; x <= maxX; x += 1) {
      let minDist = Infinity;
      for (let i = 0; i < points.length - 1; i += 1) {
        const d = distToSegment(
          x,
          y,
          points[i][0],
          points[i][1],
          points[i + 1][0],
          points[i + 1][1],
        );
        if (d < minDist) minDist = d;
      }

      const coverage = Math.max(0, Math.min(1, strokeRadius - minDist + 0.5));
      if (coverage > 0) {
        const idx = rowStart + 1 + x * 4;
        raw[idx] = Math.round(BG_R * (1 - coverage) + FG_R * coverage);
        raw[idx + 1] = Math.round(BG_G * (1 - coverage) + FG_G * coverage);
        raw[idx + 2] = Math.round(BG_B * (1 - coverage) + FG_B * coverage);
        raw[idx + 3] = 255;
      }
    }
  }

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw, {level: 6});
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

fs.mkdirSync(OUTPUT_DIR, {recursive: true});

for (const {width, height} of SPLASH_SIZES) {
  const filename = `apple-splash-${width}x${height}.png`;
  const targetPath = path.join(OUTPUT_DIR, filename);
  const pngBuffer = renderSplashPng(width, height);
  fs.writeFileSync(targetPath, pngBuffer);
}

console.log(`Generated ${SPLASH_SIZES.length} iOS splash screens in public/splash/`);
