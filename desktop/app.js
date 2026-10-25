// SPDX-License-Identifier: MPL-2.0
const api = window.samani;

// Constant local SVG icons avoid emoji rendering differences across Windows versions.
const iconPaths={home:'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',catalogue:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',planning:'M4 5h16v16H4zM8 2v6M16 2v6M4 10h16',profile:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2',library:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',settings:'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6',back:'m14 5-7 7 7 7M7 12h14',forward:'m10 5 7 7-7 7M17 12H3',reload:'M20 8a8 8 0 1 0 0 8M20 3v5h-5',browser:'M14 3h7v7M21 3l-12 12M10 3H3v18h18v-7',cinema:'M3 5h18v14H3zM8 22h8'};
const svg=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
for(const button of document.querySelectorAll('.sidebar nav button')){const name=button.dataset.route||button.dataset.panel;if(iconPaths[name])button.querySelector('.nav-icon').innerHTML=svg(iconPaths[name]);}
for(const button of document.querySelectorAll('.toolbar .icon-button')){const name=button.dataset.action||button.dataset.panel;if(iconPaths[name])button.innerHTML=svg(iconPaths[name]);}

let state, activePanel = '', quickOpen = false, currentTab = 'appearance', initialized = false, toastTimer, pendingPatch = {}, preferenceTimer;
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const t = key => state?.dictionary[key] || key;
function toast(message) { $('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,5000); }
async function call(promise) { try{return await promise;}catch(error){toast(error.message||t('problem'));} }
function translate() {
  document.documentElement.lang=state.preferences.language;
  $$('[data-i18n]').forEach(element=>element.textContent=t(element.dataset.i18n));
  $$('[data-title]').forEach(element=>{element.title=t(element.dataset.title);element.setAttribute('aria-label',t(element.dataset.title));});
  $$('[data-placeholder]').forEach(element=>element.placeholder=t(element.dataset.placeholder));
}
function media() {
  const p=state.preferences, root=document.documentElement.style;
  for(const [key,value] of Object.entries({'--a':p.colorA,'--b':p.colorB,'--angle':p.angle+'deg','--surface':p.surface/100,'--blur':p.blur+'px','--brightness':p.brightness/100}))root.setProperty(key,value);
  const gradient=$('#gradient-wall');gradient.style.background=p.background==='solid'?'#0b0c10':`linear-gradient(${p.angle}deg,${p.colorA}23,${p.colorB}15),#0b0c10`;
  const image=$('#image-wall'),video=$('#video-wall');
  image.hidden=p.background!=='image'||!state.mediaUrl;video.hidden=p.background!=='video'||!state.mediaUrl;
  if(!image.hidden&&image.getAttribute('src')!==state.mediaUrl)image.src=state.mediaUrl;
  if(!video.hidden&&video.getAttribute('src')!==state.mediaUrl){video.src=state.mediaUrl;video.load();}
  const pause=video.hidden||p.reducedMotion||(p.pauseBackground&&state.page.playing)||document.hidden;
  if(pause)video.pause();else video.play().catch(()=>{});
  document.body.classList.toggle('reduce-motion',p.reducedMotion);
}
function preferences() {
  $$('[data-pref]').forEach(input=>{
    const value=state.preferences[input.dataset.pref];
    if(input.type==='checkbox')input.checked=value;
    else if(document.activeElement!==input)input.value=value;
  });
  $$('[data-output]').forEach(output=>{const key=output.dataset.output;output.textContent=state.preferences[key]+(key==='angle'?'°':key==='blur'?' px':'%');});
  $$('[data-preset]').forEach(button=>button.classList.toggle('active',Object.entries(state.presets[button.dataset.preset]).every(([key,value])=>state.preferences[key]===value)));
  $$('[data-background]').forEach(button=>button.classList.toggle('active',button.dataset.background===state.preferences.background));
  const statusKeys={disabled:'rpcDisabled',unconfigured:'rpcUnconfigured',connecting:'rpcConnecting',unavailable:'rpcUnavailable',connected:'rpcConnected',error:'rpcError'};
  $('#rpc-status').textContent=t(statusKeys[state.rpcStatus]||'rpcDisabled');
  $('#rpc-dot').classList.toggle('connected',state.rpcStatus==='connected');
  const p=state.preferences,page=state.page,values={title:p.rpcShowTitle?page.title:'Anime Samani',episode:p.rpcShowEpisode?page.episode:'',season:p.rpcShowEpisode?page.season:'',language:page.language};
  $('#rpc-preview-title').textContent=(p.rpcTemplate||'{title}').replace(/\{(title|episode|season|language)\}/g,(_m,key)=>values[key]||'').slice(0,128)||'Anime Samani';
  $('#rpc-preview-state').textContent=[t(page.playing?'playing':'browsing'),values.season,values.episode].filter(Boolean).join(' · ');
}
function library() {
  $('#resume-episode').hidden=!state.recent.some(item=>item.episode);
  for(const [key,items] of [['favorites',state.favorites],['recent',state.recent]]){
    const container=$(`#${key}-list`);container.replaceChildren();
    if(!items.length){const empty=document.createElement('p');empty.className='empty-state';empty.textContent=t(key==='favorites'?'noFavorites':'noRecent');container.append(empty);}
    for(const item of items){
      const card=document.createElement('article');card.className='library-card';
      const title=document.createElement('h3');title.textContent=item.title;title.title=item.title;
      const detail=document.createElement('p');detail.textContent=item.episode||new URL(item.url).pathname;
      const open=document.createElement('button');open.textContent=t('open')+' ↗︎';open.onclick=()=>navigate(item.url);card.append(title,detail,open);
      if(key==='favorites'){const remove=document.createElement('button');remove.className='icon-button remove-favorite';remove.textContent='×';remove.title=t('remove');remove.onclick=()=>call(api.library('favorite',item.url));card.append(remove);}
      container.append(card);
    }
  }
  $('#favorite-count').textContent=state.favorites.length;
}
function panels() {
  for(const name of ['library','settings','about'])$(`#${name}-panel`).hidden=activePanel!==name;
  $('#error-panel').hidden=!state.error||Boolean(activePanel);
  $('#site-slot').style.visibility=state.error||activePanel?'hidden':'visible';
  $$('[data-panel]').forEach(button=>button.classList.toggle('active',button.dataset.panel===activePanel));
  $$('[data-tab]').forEach(button=>button.classList.toggle('active',button.dataset.tab===currentTab));
  for(const name of ['appearance','desktop','discord'])$(`#${name}-tab`).hidden=currentTab!==name;
  if(state.error)$('#error-code').textContent=`${state.error.kind==='http'?'HTTP':t('network')} ${state.error.code}`;
  reportBounds();
}
function render(next) {
  state=next;
  if(activePanel && state.panel===false && !quickOpen)activePanel='';
  translate();media();preferences();library();panels();
  $('#version').textContent=state.version;
  const updateKeys={unsupported:'updateUnsupported',checking:'updateChecking',available:'updateAvailable',downloading:'updateDownloading',downloaded:'updateDownloaded',current:'updateCurrent',error:'updateError'};
  $('#update-status').textContent=t(updateKeys[state.update?.status]||'updateIdle')+(state.update?.percent?' '+state.update.percent+'%':'');
  $('#download-update').hidden=state.update?.status!=='available';$('#install-update').hidden=state.update?.status!=='downloaded';
  const cover=document.querySelector('.presence-preview img');cover.onerror=()=>{cover.onerror=null;cover.src='../assets/branding/mark.png';};cover.src=(state.page.playing||state.page.duration>0)&&state.preferences.rpcShowTitle&&state.page.image?state.page.image:'../assets/branding/mark.png';
  $('#page-title').textContent=state.page.title||'anime-sama.to';
  $('#page-status').textContent=state.error?t('errorTitle'):state.loading?t('loading'):t('ready');
  $('#play-status').textContent=state.page.playing?'● '+t('nowPlaying'):'';
  $('#progress').classList.toggle('loading',state.loading&&!state.error);
  const favorite=state.favorites.some(item=>item.url===state.page.url);$('#favorite-button').textContent=favorite?'★':'☆';$('#favorite-button').classList.toggle('active',favorite);$('#favorite-button').title=t(favorite?'favorited':'favorite');
  document.body.classList.toggle('cinema',state.cinema);
  let path='';try{path=new URL(state.page.url).pathname;}catch{}
  $$('[data-route]').forEach(button=>button.classList.toggle('active',!activePanel&&(button.dataset.route==='home'?path==='/':path.startsWith({catalogue:'/catalogue',planning:'/planning',profile:'/profil'}[button.dataset.route]))));
  if(quickOpen)quickResults();
  if(!initialized){initialized=true;intro();}
  requestAnimationFrame(reportBounds);
}
function reportBounds() { const rect=$('#site-slot').getBoundingClientRect();api.bounds({x:rect.x,y:rect.y,width:rect.width,height:rect.height}); }
async function setPanel(name='') { activePanel=name;quickOpen=false;$('#quick-overlay').hidden=true;await call(api.panel(Boolean(name)));panels();if(name==='library')library(); }
async function navigate(route) { await setPanel('');await call(api.navigate(route)); }
async function patch(value) { const next=await call(api.preferences(value));if(next)render(next); }
function queuePatch(key,value) {pendingPatch[key]=value;clearTimeout(preferenceTimer);preferenceTimer=setTimeout(()=>{const value=pendingPatch;pendingPatch={};patch(value);},130);}
function quickResults() {
  const search=$('#quick-input').value.toLocaleLowerCase(state.preferences.language);
  const routes=['home','catalogue','planning','profile','library','settings'];
  const entries=[...routes.map(route=>({title:t(route),route})),...state.favorites.map(item=>({title:item.title,route:item.url})),...state.recent.slice(0,8).map(item=>({title:item.title,route:item.url}))];
  const container=$('#quick-results');container.replaceChildren();
  for(const entry of entries.filter(item=>item.title.toLocaleLowerCase(state.preferences.language).includes(search)).slice(0,9)){
    const button=document.createElement('button');button.className='quick-result';button.textContent=entry.title;
    button.onclick=()=>entry.route==='library'||entry.route==='settings'?setPanel(entry.route):navigate(entry.route);container.append(button);
  }
}
async function showQuick() {quickOpen=true;await call(api.panel(true));$('#quick-overlay').hidden=false;$('#quick-input').value='';quickResults();$('#quick-input').focus();}
async function closeQuick(){quickOpen=false;$('#quick-overlay').hidden=true;await call(api.panel(Boolean(activePanel)));reportBounds();}
function intro() {
  const element=$('#intro');
  if(!state.preferences.intro){element.hidden=true;api.action('intro-done');return;}
  const end=()=>{element.classList.add('leaving');setTimeout(()=>{element.hidden=true;api.action('intro-done');},state.preferences.reducedMotion?0:450);};
  setTimeout(end,state.preferences.intro?(state.preferences.reducedMotion?180:1600):0);
}
$$('[data-route]').forEach(button=>button.onclick=()=>navigate(button.dataset.route));
$$('[data-panel]').forEach(button=>button.onclick=()=>button.dataset.panel==='quick'?showQuick():setPanel(button.dataset.panel));
$$('.close-panel').forEach(button=>button.onclick=()=>setPanel(''));
$$('[data-action]').forEach(button=>button.onclick=()=>button.dataset.action==='home'?navigate('home'):call(api.action(button.dataset.action)));
$$('[data-tab]').forEach(button=>button.onclick=()=>{currentTab=button.dataset.tab;panels();});
$$('[data-pref]').forEach(input=>input.addEventListener('input',()=>{let value=input.type==='checkbox'?input.checked:input.type==='range'?Number(input.value):input.value;queuePatch(input.dataset.pref,value);}));
$$('[data-preset]').forEach(button=>button.onclick=()=>patch({theme:button.dataset.preset,...state.presets[button.dataset.preset]}));
$$('[data-background]').forEach(button=>button.onclick=()=>patch({background:button.dataset.background}));
$('#choose-image').onclick=()=>call(api.media('image'));$('#choose-video').onclick=()=>call(api.media('video'));
$('#favorite-button').onclick=()=>call(api.library('favorite'));
$('#clear-recent').onclick=()=>call(api.library('clear-recent'));
$('#quick-button').onclick=showQuick;$('#close-quick').onclick=closeQuick;$('#quick-input').oninput=quickResults;
$('#quick-input').onkeydown=event=>{if(event.key==='Enter')$('#quick-results button')?.click();};
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(quickOpen)closeQuick();else if(activePanel)setPanel('');}});
document.addEventListener('visibilitychange',()=>state&&media());
$('#video-wall').addEventListener('error',()=>toast(t('invalidMedia')));
new ResizeObserver(reportBounds).observe($('#site-slot'));
api.onState(render);api.onCommand(command=>command==='quick'?showQuick():setPanel(command));
call(api.bootstrap()).then(next=>{if(next)render(next);});

$('#check-update').onclick=()=>call(api.update('check'));$('#download-update').onclick=()=>call(api.update('download'));$('#install-update').onclick=()=>call(api.update('install'));

$('#resume-episode').onclick=()=>navigate('resume');
