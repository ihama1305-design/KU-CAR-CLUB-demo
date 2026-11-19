export {};
const menu=document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav=document.querySelector<HTMLElement>('#navigation');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav?.classList.toggle('open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){menu.click();menu.focus()}});
const hero=document.querySelector<HTMLVideoElement>('#hero-video');
const toggle=document.querySelector<HTMLButtonElement>('#video-toggle');
const full=document.querySelector<HTMLVideoElement>('#full-film');
const filmPlay=document.querySelector<HTMLButtonElement>('#film-play');
if(hero&&toggle){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const connection=(navigator as Navigator & {connection?:EventTarget & {saveData?:boolean;effectiveType?:string}}).connection;
 let userPaused=false,visible=true,allowed=false,failed=false;
 const restrained=()=>reduced.matches||!!connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType||'');
 const sync=()=>{toggle.textContent=hero.paused?'Play background video â–·':'Pause background video â…¡';toggle.setAttribute('aria-pressed',String(!hero.paused))};
 const play=async(manual=false)=>{if(!manual&&(!allowed||userPaused||failed||!visible||document.hidden||full&&!full.paused))return;if(manual){allowed=true;failed=false;userPaused=false}if(!hero.getAttribute('src'))hero.src=(matchMedia('(max-width: 700px)').matches?hero.dataset.mobile:hero.dataset.desktop)!;hero.muted=true;try{await hero.play()}catch{failed=true;hero.autoplay=false;hero.pause();sync()}};
 toggle.addEventListener('click',()=>{if(hero.paused){void play(true)}else{userPaused=true;hero.pause()}});
 hero.addEventListener('play',sync);hero.addEventListener('pause',sync);hero.addEventListener('error',()=>{failed=true;hero.pause();sync()});
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)hero.pause();else void play()},{threshold:.15});observer.observe(hero);
 const visibility=()=>{if(document.hidden)hero.pause();else void play()};document.addEventListener('visibilitychange',visibility);
 const preferences=()=>{allowed=!restrained();if(!allowed)hero.pause();else void play()};reduced.addEventListener('change',preferences);connection?.addEventListener('change',preferences);
 full?.addEventListener('play',()=>hero.pause());full?.addEventListener('pause',()=>void play());
 allowed=!restrained();sync();if(allowed)void play();
 window.addEventListener('pagehide',()=>{hero.pause();observer.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',preferences);connection?.removeEventListener('change',preferences)},{once:true});
}
filmPlay?.addEventListener('click',async()=>{if(!full)return;full.src=full.dataset.src!;full.controls=true;hero?.pause();filmPlay.hidden=true;try{await full.play()}catch{filmPlay.hidden=false;filmPlay.textContent='Try playing the film again'}});
const floating=document.querySelector<HTMLAnchorElement>('.floating-join');
const cta=document.querySelector('#hero-cta');const footer=document.querySelector('footer');
if(floating&&cta&&footer){let ctaVisible=true,footerVisible=false;const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.target===cta)ctaVisible=e.isIntersecting;else footerVisible=e.isIntersecting}floating.hidden=ctaVisible||footerVisible});observer.observe(cta);observer.observe(footer)}
const items=Array.from(document.querySelectorAll<HTMLAnchorElement>('.gallery-item'));
const filters=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-filter]'));
const count=document.querySelector('#gallery-count');
const filter=(tag:string)=>{let total=0;items.forEach(item=>{item.hidden=tag!=='All'&&item.dataset.tag!==tag;if(!item.hidden)total++});filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===tag)));if(count)count.textContent=`${total} photograph${total===1?'':'s'}`;const empty=document.querySelector<HTMLElement>('#gallery-empty');if(empty)empty.hidden=total>0};
filters.forEach(b=>b.addEventListener('click',()=>filter(b.dataset.filter!)));
const initial=new URLSearchParams(location.search).get('filter');if(initial&&filters.some(b=>b.dataset.filter===initial))filter(initial);
const dialog=document.querySelector<HTMLDialogElement>('#lightbox');let current=0;let opener:HTMLElement|null=null;
const selected=()=>items.filter(i=>!i.hidden);
const show=(index:number)=>{const list=selected();current=(index+list.length)%list.length;const a=list[current];const image=document.querySelector<HTMLImageElement>('#lightbox-image')!;image.src=a.href;image.alt=a.dataset.caption!;document.querySelector('#lightbox-caption')!.textContent=a.dataset.caption!;document.querySelector('#lightbox-position')!.textContent=`${current+1} / ${list.length}`};
items.forEach(item=>item.addEventListener('click',e=>{if(!dialog)return;e.preventDefault();opener=item;show(selected().indexOf(item));dialog.showModal();document.body.style.overflow='hidden'}));
document.querySelector('#lightbox-close')?.addEventListener('click',()=>dialog?.close());
document.querySelector('#lightbox-prev')?.addEventListener('click',()=>show(current-1));document.querySelector('#lightbox-next')?.addEventListener('click',()=>show(current+1));
dialog?.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus()});
dialog?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(current-1);if(e.key==='ArrowRight')show(current+1)});

