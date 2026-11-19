import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import QRCode from 'qrcode';
import ffmpeg from 'ffmpeg-static';
import { execFileSync } from 'node:child_process';
const source = process.argv[2] || 'C:/Users/hp/Desktop/KU CAR CLUB';
const out = 'public/media';
await fs.mkdir(out,{recursive:true}); await fs.mkdir('originals',{recursive:true}); await fs.mkdir('src/data',{recursive:true});
const files=(await fs.readdir(source)).filter(f=>f.endsWith('.jpeg')).sort();
const descriptions=['Green Ford Mustang with raised doors under green lights','A teddy bear resting on a silver Mercedes bonnet','Visitors gathered at a food stand at night','People talking beside a turquoise sports car','A dark Nissan with an open bonnet and colourful display','Orange sports car beside visitors at the meet','Rear lights and spoiler of a dark Ford Mustang','Silver, red and blue sports cars lined up at night','Red classic Mini parked at the gathering','A row of cars illuminated by red lights','Rear of a white sports coupe with graphic artwork','Red wheel and illustrated bodywork of a white coupe','Black classic Porsche under evening lights','A red and black motorcycle with visitors nearby','Engine cover and rear wing of an orange McLaren','Rear view of an orange McLaren at the gathering','Blue Ford Mustang photographed outdoors','Grey Toyota Supra photographed outdoors','White modified SUV photographed outdoors','White BMW sedan photographed outdoors','People talking beside a white SUV','Dark Ford Mustang photographed outdoors','Alternate view of the blue Ford Mustang'];
const media=[];
for (let i=0;i<files.length;i++) { const file=files[i]; const buf=await fs.readFile(path.join(source,file)); await fs.writeFile(path.join('originals',file),buf); const m=await sharp(buf).rotate().metadata(); const id=`local-${String(i+1).padStart(2,'0')}`; const widths=[480,960,1440].filter(w=>w<m.width); widths.push(Math.min(m.width,1920)); const unique=[...new Set(widths)]; for(const width of unique) await sharp(buf).rotate().resize({width,withoutEnlargement:true}).webp({quality:80}).toFile(`${out}/${id}-${width}.webp`); await sharp(buf).rotate().resize({width:Math.min(m.width,1440),withoutEnlargement:true}).jpeg({quality:85}).toFile(`${out}/${id}.jpg`); media.push({id,file,width:m.width,height:m.height,widths:unique,alt:descriptions[i],tag:i<16?'After dark':'In focus',sha256:crypto.createHash('sha256').update(buf).digest('hex')}); }
await fs.writeFile('src/data/media.json',JSON.stringify(media,null,2));
const video=(await fs.readdir(source)).find(f=>f.endsWith('.mp4'));
if(video) { const input=path.join(source,video); await fs.copyFile(input,`${out}/club-film.mp4`); for(const [name,width,crf] of [['hero-desktop',1280,'27'],['hero-mobile',854,'29']]) execFileSync(ffmpeg,['-y','-i',input,'-t','10','-an','-vf',`scale=${width}:-2`,'-c:v','libx264','-crf',crf,'-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart',`${out}/${name}.mp4`],{stdio:'ignore'}); execFileSync(ffmpeg,['-y','-ss','0.4','-i',input,'-frames:v','1',`${out}/poster.jpg`],{stdio:'ignore'}); execFileSync(ffmpeg,['-y','-i',input,'-vf','fps=1/2,scale=320:-1,tile=3x2','-frames:v','1','video-contact.jpg'],{stdio:'ignore'}); }
const club=JSON.parse(await fs.readFile('src/data/club.json','utf8'));
const options={errorCorrectionLevel:'Q',margin:4,width:530,color:{dark:'#111111',light:'#ffffff'}};
await QRCode.toFile(`${out}/join-qr.png`,club.whatsapp,options); await fs.writeFile(`${out}/join-qr.svg`,await QRCode.toString(club.whatsapp,{...options,type:'svg'}));
console.log(`Prepared ${media.length} images, video derivatives, and QR assets.`);

