import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import QRCode from 'qrcode';
import ffmpeg from 'ffmpeg-static';
import { execFileSync } from 'node:child_process';

const source = process.argv[2] || 'originals';
const out = 'public/media';
const media = JSON.parse(await fs.readFile('src/data/media.json', 'utf8'));
const video = 'WhatsApp Video 2026-11-19 at 2.39.22 AM.mp4';
const digest = buffer => crypto.createHash('sha256').update(buffer).digest('hex');

// Validate every input before changing published assets. Filenames never set captions.
const inputs = await Promise.all(media.map(async item => {
  const buffer = await fs.readFile(path.join(source, item.file));
  if (digest(buffer) !== item.sha256) throw new Error(`Source changed: ${item.file}. Review the image and update its manifest deliberately.`);
  return { item, buffer };
}));
const videoInput = path.join(source, video);
await fs.access(videoInput);
await fs.mkdir(out, { recursive: true });
await fs.mkdir('originals', { recursive: true });
for (const { item, buffer } of inputs) {
  await fs.writeFile(path.join('originals', item.file), buffer);
  const { info } = await sharp(buffer).rotate().toBuffer({ resolveWithObject: true });
  item.width = info.width;
  item.height = info.height;
  item.widths = [...new Set([480, 960, 1440, Math.min(info.width, 1920)].filter(w => w <= info.width))];
  for (const width of item.widths) {
    await sharp(buffer).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(`${out}/${item.id}-${width}.webp`);
  }
  await sharp(buffer).rotate().resize({ width: Math.min(info.width, 1440), withoutEnlargement: true }).jpeg({ quality: 85 }).toFile(`${out}/${item.id}.jpg`);
}
await fs.writeFile('src/data/media.json', JSON.stringify(media, null, 2) + '\n');
if (path.resolve(videoInput) !== path.resolve('originals', video)) await fs.copyFile(videoInput, path.join('originals', video));
await fs.copyFile(videoInput, `${out}/club-film.mp4`);
for (const [name, width, crf] of [['hero-desktop', 1280, '27'], ['hero-mobile', 854, '29']]) {
  execFileSync(ffmpeg, ['-y', '-i', videoInput, '-t', '10', '-an', '-vf', `scale=min(${width}\\,iw):-2`, '-c:v', 'libx264', '-crf', crf, '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${out}/${name}.mp4`], { stdio: 'ignore' });
}
execFileSync(ffmpeg, ['-y', '-ss', '0.4', '-i', videoInput, '-frames:v', '1', `${out}/poster.jpg`], { stdio: 'ignore' });
const club = JSON.parse(await fs.readFile('src/data/club.json', 'utf8'));
const options = { errorCorrectionLevel: 'Q', margin: 4, width: 530, color: { dark: '#111111', light: '#ffffff' } };
await QRCode.toFile(`${out}/join-qr.png`, club.whatsapp, options);
await fs.writeFile(`${out}/join-qr.svg`, await QRCode.toString(club.whatsapp, { ...options, type: 'svg' }));
console.log(`Prepared ${media.length} verified photographs; hero excerpt 00:00–00:10; full film and QR.`);
for (const name of ['hero-desktop.mp4', 'hero-mobile.mp4', 'club-film.mp4']) console.log(`${name}: ${(await fs.stat(`${out}/${name}`)).size} bytes`);
