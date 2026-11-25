const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const frontendDir = path.join(projectRoot, 'frontend');
const srcAppDir = path.join(frontendDir, 'src', 'app');
const apiDir = path.join(srcAppDir, 'api');
const proxyFile = path.join(frontendDir, 'src', 'proxy.ts');
const stashDir = path.join(projectRoot, '.tmp-export-stash');
const publicDir = path.join(frontendDir, 'public');
const outDir = path.join(projectRoot, 'deploy-public');

/**
 * Generate a valid 32x32 32-bit ICO binary in frontend/public/favicon.ico
 * featuring LUGIE's navy & teal brand mark so /favicon.ico always returns 200.
 */
function ensureFaviconIco() {
  const icoPath = path.join(publicDir, 'favicon.ico');
  const size = 32;
  const pixelBytes = size * size * 4;
  const andMaskBytes = (size * size) / 8;
  const dibHeaderSize = 40;
  const imageSize = dibHeaderSize + pixelBytes + andMaskBytes;
  const buf = Buffer.alloc(6 + 16 + imageSize);

  // ICONDIR header
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(1, 4);

  // ICONDIRENTRY
  buf.writeUInt8(size, 6);
  buf.writeUInt8(size, 7);
  buf.writeUInt8(0, 8);
  buf.writeUInt8(0, 9);
  buf.writeUInt16LE(1, 10);
  buf.writeUInt16LE(32, 12);
  buf.writeUInt32LE(imageSize, 14);
  buf.writeUInt32LE(22, 18);

  // BITMAPINFOHEADER
  const o = 22;
  buf.writeUInt32LE(dibHeaderSize, o);
  buf.writeInt32LE(size, o + 4);
  buf.writeInt32LE(size * 2, o + 8);
  buf.writeUInt16LE(1, o + 12);
  buf.writeUInt16LE(32, o + 14);
  buf.writeUInt32LE(0, o + 16);
  buf.writeUInt32LE(pixelBytes + andMaskBytes, o + 20);

  const pxStart = o + dibHeaderSize;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const row = size - 1 - y;
      const idx = pxStart + (row * size + x) * 4;

      const dx = Math.max(6 - x, 0, x - (size - 7));
      const dy = Math.max(6 - y, 0, y - (size - 7));
      const inside = dx * dx + dy * dy <= 36;

      if (!inside) {
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
        continue;
      }

      const inVertL = x >= 8 && x <= 11 && y >= 7 && y <= 24;
      const inHorzL = x >= 8 && x <= 19 && y >= 21 && y <= 24;
      const dotDistSq = (x - 22.5) ** 2 + (y - 22.5) ** 2;
      const inDot = dotDistSq <= 9;

      if (inDot) {
        buf[idx] = 0xa6;
        buf[idx + 1] = 0xb8;
        buf[idx + 2] = 0x14;
        buf[idx + 3] = 0xff;
      } else if (inVertL || inHorzL) {
        buf[idx] = 0xff;
        buf[idx + 1] = 0xff;
        buf[idx + 2] = 0xff;
        buf[idx + 3] = 0xff;
      } else {
        buf[idx] = 0x2e;
        buf[idx + 1] = 0x1c;
        buf[idx + 2] = 0x0f;
        buf[idx + 3] = 0xff;
      }
    }
  }

  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(icoPath, buf);
  console.log('✓ Generated valid favicon.ico');
}

ensureFaviconIco();

// Build static export bundle cleanly while preserving local BFF files in git
fs.rmSync(stashDir, { recursive: true, force: true });
fs.mkdirSync(stashDir, { recursive: true });

const stashedApi = path.join(stashDir, 'api');
const stashedProxy = path.join(stashDir, 'proxy.ts');
const staticOut = path.join(frontendDir, 'out');
const nextBuildCache = path.join(frontendDir, '.next');

try {
  if (fs.existsSync(apiDir)) fs.renameSync(apiDir, stashedApi);
  if (fs.existsSync(proxyFile)) fs.renameSync(proxyFile, stashedProxy);
  fs.rmSync(staticOut, { recursive: true, force: true });
  fs.rmSync(nextBuildCache, { recursive: true, force: true });

  console.log('Running Next.js static export build (STATIC_EXPORT=1)...');
  execSync('npx next build', {
    cwd: frontendDir,
    stdio: 'inherit',
    env: { ...process.env, STATIC_EXPORT: '1' },
  });
} finally {
  if (fs.existsSync(stashedApi) && !fs.existsSync(apiDir)) fs.renameSync(stashedApi, apiDir);
  if (fs.existsSync(stashedProxy) && !fs.existsSync(proxyFile)) fs.renameSync(stashedProxy, proxyFile);
  fs.rmSync(stashDir, { recursive: true, force: true });
}

if (!fs.existsSync(staticOut)) {
  throw new Error('Static export failed: frontend/out directory was not produced.');
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.cpSync(staticOut, outDir, { recursive: true });

// Fix Next.js 16 Windows static export segment path quirk:
// Next.js writes nested dirs like `about/__next.about/__PAGE__.txt` on Windows,
// while the client router requests dot-joined `about/__next.about.__PAGE__.txt`.
function flattenNextSegmentDirs(dir) {
  let flattenedCount = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.name.startsWith('__next.')) {
      const walkNested = (subDir, parts) => {
        for (const sub of fs.readdirSync(subDir, { withFileTypes: true })) {
          const subPath = path.join(subDir, sub.name);
          if (sub.isDirectory()) {
            walkNested(subPath, [...parts, sub.name]);
          } else if (sub.isFile()) {
            const flatName = `${entry.name}.${[...parts, sub.name].join('.')}`;
            fs.copyFileSync(subPath, path.join(dir, flatName));
            flattenedCount++;
          }
        }
      };
      walkNested(fullPath, []);
    } else {
      flattenedCount += flattenNextSegmentDirs(fullPath);
    }
  }
  return flattenedCount;
}

const flatFiles = flattenNextSegmentDirs(outDir);
console.log(`✓ Flattened ${flatFiles} Next.js RSC segment payload files for Firebase Hosting`);
console.log('✓ Production static export bundle ready in deploy-public!');
