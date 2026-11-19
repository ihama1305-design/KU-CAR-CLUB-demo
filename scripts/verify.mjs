import {chromium,firefox,webkit} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import jsQR from 'jsqr';
import {gzipSync} from 'node:zlib';
const club=JSON.parse(await fs.readFile('src/data/club.json','utf8'));
const origin=(process.env.TEST_URL||'http://127.0.0.1:4321').replace(/\/$/,'');
const home=`${origin}/`;
await fs.mkdir('test-results',{recursive:true});
const reports=[];
let browsersTested=0;
for(const type of ['png','svg'])for(const width of [225,250,270,530]){const {data,info}=await sharp(`public/media/join-qr.${type}`).resize(width,width,{kernel:'nearest'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(jsQR(new Uint8ClampedArray(data),info.width,info.height)?.data,club.whatsapp)}reports.push('QR: SVG and PNG decoded independently at 225, 250, 270, 530 pixels.');
for(const [name,engine] of [['chromium',chromium],['firefox',firefox],['webkit',webkit]]){
let browser;try{browser=await engine.launch({headless:true,...(name==='chromium'&&process.env.USE_EDGE?{channel:'msedge'}:{})})}catch(e){reports.push(`${name}: unavailable: ${e.message.split('\n')[0]}`);continue}
try{
browsersTested++;
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(home);await page.waitForTimeout(800);
for(const link of await page.locator('[data-join]').all())assert.equal(await link.getAttribute('href'),club.whatsapp);
for(const [width,height] of [[320,568],[375,812],[390,844],[430,932],[768,1024],[820,1180],[1024,768],[1366,768],[1440,900],[1920,1080],[844,390],[1100,800]]){await page.setViewportSize({width,height});await page.waitForTimeout(100);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name}: overflow ${width}`)}
await page.setViewportSize({width:1440,height:900});await page.screenshot({path:`test-results/${name}-desktop.png`,fullPage:true});
await page.setViewportSize({width:390,height:844});await page.screenshot({path:`test-results/${name}-mobile.png`,fullPage:true});
await page.locator('.menu-toggle').click();assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
await page.goto(`${origin}/gallery/`);await page.getByRole('button',{name:'In focus',exact:true}).click();assert.equal(await page.locator('.gallery-item:visible').count(),7);await page.locator('.gallery-item:visible').first().click();assert(await page.locator('#lightbox').isVisible());await page.getByRole('button',{name:'Next photograph'}).click();assert.equal(await page.locator('#lightbox-position').textContent(),'2 / 7');await page.keyboard.press('Escape');assert(!(await page.locator('#lightbox').isVisible()));assert(await page.locator('.gallery-item:visible').first().evaluate(el=>el===document.activeElement));
for(const route of ['about/','events/','join/','404.html']){await page.goto(`${origin}/${route}`);assert.equal(await page.locator('h1,h2').count()>0,true);for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} overflow at ${width}`)}for(const link of await page.locator('[data-join],.qr-card a:not([download])').all())assert.equal(await link.getAttribute('href'),club.whatsapp)}
await page.goto(`${origin}/join/`);const qr=await page.locator('.qr-card img').screenshot();const decoded=await sharp(qr).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(jsQR(new Uint8ClampedArray(decoded.data),decoded.info.width,decoded.info.height)?.data,club.whatsapp);
// Browser zoom at 200% on a 1280px window exposes a 640 CSS-pixel layout viewport.
await page.setViewportSize({width:640,height:450});await page.goto(home);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% equivalent reflow overflow');await page.setViewportSize({width:1280,height:900});
assert.equal(await page.locator('#full-film').getAttribute('src'),null);
await page.emulateMedia({reducedMotion:'reduce'});await page.goto(home);assert.equal(await page.locator('#hero-video').getAttribute('src'),null);await page.getByRole('button',{name:'Play background video'}).click();await page.waitForTimeout(1200);assert(await page.locator('#hero-video').getAttribute('src'));
await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(home);await page.waitForTimeout(2000);const playing=await page.locator('#hero-video').evaluate(v=>!v.paused);reports.push(`${name}: initial autoplay ${playing?'played':'blocked/unavailable; fallback shown'}`);
if(playing){
await page.locator('#community').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#hero-video').paused);await page.evaluate(()=>scrollTo(0,0));await page.waitForFunction(()=>!document.querySelector('#hero-video').paused);
await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});assert(await page.locator('#hero-video').evaluate(v=>v.paused));await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});await page.waitForFunction(()=>!document.querySelector('#hero-video').paused);
await page.getByRole('button',{name:'Pause background video'}).click();await page.locator('footer').scrollIntoViewIfNeeded();await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(400);assert(await page.locator('#hero-video').evaluate(v=>v.paused));
}
await page.locator('#film-play').click();assert(await page.locator('#full-film').getAttribute('src'));assert(await page.locator('#hero-video').evaluate(v=>v.paused));assert(await page.locator('.floating-join').isHidden());
assert.equal(errors.length,0,errors.join('\n'));
await page.close();
const saved=await browser.newContext();await saved.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,addEventListener(){},removeEventListener(){}}}));const sp=await saved.newPage();await sp.goto(home);assert.equal(await sp.locator('#hero-video').getAttribute('src'),null);await saved.close();
const slow=await browser.newContext();await slow.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{effectiveType:'2g',addEventListener(){},removeEventListener(){}}}));const slowPage=await slow.newPage();await slowPage.goto(home);assert.equal(await slowPage.locator('#hero-video').getAttribute('src'),null);await slow.close();
const blocked=await browser.newContext();await blocked.addInitScript(()=>HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Blocked','NotAllowedError'))});const bp=await blocked.newPage();await bp.goto(home);await bp.waitForTimeout(300);assert(await bp.getByRole('button',{name:'Play background video'}).isVisible());await blocked.close();
// WebKit's native media loader can bypass Playwright request routing. Serve HTML
// with genuinely nonexistent media URLs so every engine exercises an actual 404.
const missing=await browser.newContext();const mp=await missing.newPage();await mp.route(`${origin}/`,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replaceAll('media/hero-','media/missing-hero-')})});await mp.goto(`${origin}/`);await mp.waitForFunction(()=>document.querySelector('#hero-video').error!==null);assert(await mp.getByRole('button',{name:'Play background video'}).isVisible());assert(await mp.locator('#hero-cta [data-join]').isVisible());await missing.close();
const nojs=await browser.newContext({javaScriptEnabled:false});const np=await nojs.newPage();await np.goto(`${origin}/gallery/`);assert.equal(await np.locator('.gallery-item').count(),23);assert.equal(await np.locator('.nav-join').getAttribute('href'),club.whatsapp);await nojs.close();
reports.push(`${name}: responsive widths, menu, WhatsApp links, gallery/filter/lightbox/focus, routes, reduced motion, Save-Data, rejected autoplay, missing media, no-JS gallery passed.`);
reports.push(`${name}: displayed QR decode, 200% equivalent reflow, offscreen and simulated hidden-tab pause/resume, explicit pause persistence, lazy full film, floating-link clearance, simulated 2g passed.`);
}finally{await browser.close()}}
assert(browsersTested>0,'No browser available; install Playwright browsers.');
const assets=await fs.readdir('dist/_astro');let js=0;for(const a of assets.filter(x=>x.endsWith('.js')))js+=gzipSync(await fs.readFile(`dist/_astro/${a}`)).length;reports.push(`Total generated JS gzip: ${js} bytes.`);
await fs.writeFile('test-results/report.txt',reports.join('\n'));console.log(reports.join('\n'));
