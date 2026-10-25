// SPDX-License-Identifier: MPL-2.0
// Anime Samani. Original application: AlexAnimateMp4. See CREDITS.md.
const { app, BrowserWindow, WebContentsView, ipcMain, Menu, Tray, dialog, shell, protocol, net, nativeTheme } = require('electron');
const { join, extname, basename } = require('node:path');
const { pathToFileURL } = require('node:url');
const { readFileSync, existsSync, mkdirSync, copyFileSync, statSync } = require('node:fs');
const { randomBytes } = require('node:crypto');
const Store = require('electron-store');
const pkg = require('./package.json');
const { defaults, presets, sanitize, websiteCss } = require('./lib/preferences');
const { SITE_URL, isSiteUrl, migrateSiteUrl, installNavigation } = require('./lib/navigation');
const { sampleFrames, seekFrame, progressKey } = require('./lib/playback');
const { installUpdates } = require('./lib/updates');
const { Presence, buildActivity } = require('./lib/presence');
const dictionaries = { fr: require('./desktop/i18n/fr.json'), en: require('./desktop/i18n/en.json'), ja: require('./desktop/i18n/ja.json') };
const repository = pkg.repository.url.replace(/\.git$/, '');
protocol.registerSchemesAsPrivileged([{ scheme: 'samani-media', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }]);
app.setName('Anime Samani');
// Keep the 0.2 profile path so website history/cookies survive the rebrand.
app.setPath('userData', process.env.SAMANI_TEST_PROFILE || join(app.getPath('appData'), 'anime-sama-to-desktop'));
const startup = async () => {
  await app.whenReady(); nativeTheme.themeSource = 'dark';
  const config = new Store({ name: 'samani-preferences' });
  const libraryStore = new Store({ name: 'samani-library', defaults: { favorites: [], recent: [] } });
  let preferences = sanitize(config.get('preferences', defaults));
  if (!config.has('preferences')) {
    try {
      const old = JSON.parse(readFileSync(join(app.getPath('userData'), 'settings.json'), 'utf8')).ANIME_SAMA_JUST_A_JAD;
      if (old) preferences = sanitize({ language: 'fr', alwaysOnTop: old.ALWAYS_ON_TOP, minimizeToTray: old.MINIMIZE_TO_TRAY, rememberWindow: old.SAVE_WINDOW_SIZE, startAtLogin: old.START_UP });
    } catch { /* A fresh installation starts with the French Samani theme. */ }
    config.set('preferences', preferences);
  }
  const mediaDir = join(app.getPath('userData'), 'samani-media'); mkdirSync(mediaDir, { recursive: true });
  protocol.handle('samani-media', request => {
    const url = new URL(request.url); const file = url.pathname.slice(1);
    if (url.host !== 'background' || !/^[a-f0-9]{32}\.(png|jpg|jpeg|webp|mp4|webm)$/.test(file) || !existsSync(join(mediaDir, file))) return new Response('', { status: 404 });
    return net.fetch(pathToFileURL(join(mediaDir, file)).href);
  });
  const savedBounds = config.get('window', {});
  const window = new BrowserWindow({
    width: preferences.rememberWindow ? Math.max(980, Math.min(2200, savedBounds.width || 1360)) : 1360,
    height: preferences.rememberWindow ? Math.max(680, Math.min(1500, savedBounds.height || 900)) : 900,
    minWidth: 980, minHeight: 680, show: false, title: 'Anime Samani', backgroundColor: '#0b0c10',
    icon: join(__dirname, 'icon.png'), autoHideMenuBar: true,
    webPreferences: { preload: join(__dirname, 'desktop/preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  window.setAlwaysOnTop(preferences.alwaysOnTop);
  const site = new WebContentsView({ webPreferences: { preload: join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  window.contentView.addChildView(site); site.setBackgroundColor('#00000000'); site.setVisible(false);
  const wc = site.webContents; let page = { title: 'Anime Sama', url: SITE_URL, episode: '', season: '', language: '', playing: false };
  let error = null; let loading = true; let panel = false; let intro = preferences.intro; let cinema = false; let cssKey; let since = Date.now(); let quitting = false; let ready = false;
  let bounds = { x: 244, y: 88, width: 1100, height: 730 }; let tray;
  const presence = new Presence(); let rpcTimer;
  const updates=installUpdates(app,window,()=>send(),()=>preferences.language);
  const progress=new Store({name:'samani-progress',accessPropertiesByDotNotation:false});let sampling=false,restoredKey='',pendingResume=null;
  const t = key => dictionaries[preferences.language][key] || key;
  const state = () => ({ preferences, presets, page, error, loading, cinema, panel, rpcStatus: presence.status, update:updates.state(), favorites: libraryStore.get('favorites', []), recent: libraryStore.get('recent', []), version: pkg.version, repository, dictionary: dictionaries[preferences.language], mediaUrl: preferences.media ? `samani-media://background/${preferences.media}` : null });
  const send = () => { if (ready && !window.isDestroyed()) window.webContents.send('samani:state', state()); };
  const visibility = () => { if (!wc.isDestroyed()) { site.setBounds(bounds); site.setVisible(!panel && !error && !intro && bounds.width > 0 && bounds.height > 0); } };
  const updateRpc = () => {
    clearTimeout(rpcTimer);
    presence.configure(preferences.rpcEnabled, preferences.rpcClientId);
    presence.update(buildActivity(page, preferences, since, repository));
  };
  const scheduleRpc = () => { clearTimeout(rpcTimer); rpcTimer = setTimeout(updateRpc, 1000); rpcTimer.unref?.(); };
  presence.on('status', send);
  const navigation = installNavigation(wc, failure => { error = failure; loading = false; page.playing = false;  visibility(); updateRpc(); send(); });
  const navigate = async url => {
    const migrated = migrateSiteUrl(url);
    if (!isSiteUrl(migrated)) return false;
    error = null; loading = true; panel = false; visibility(); send();
    return navigation.load(migrated);
  };
  const reload = () => navigate(error?.url || page.url || SITE_URL);
  const fontBytes=[...readFileSync(join(__dirname,'assets/fonts/Beckman-FREE.otf'))];
  const applyWebsite = async () => {
    if (!isSiteUrl(wc.getURL())) return;
    try { await wc.executeJavaScript(`(async()=>{if(![...document.fonts].some(font=>font.family==='Beckman')){const f=new FontFace('Beckman',new Uint8Array(${JSON.stringify(fontBytes)}).buffer);await f.load();document.fonts.add(f);}})()`); if (cssKey) await wc.removeInsertedCSS(cssKey); cssKey = await wc.insertCSS(websiteCss(preferences)); } catch { /* Navigation may replace the document between updates. */ }
  };
  function setMenu() {
    const items = [
      { label: t('home'), accelerator: 'Alt+Home', click: () => navigate(SITE_URL) },
      { label: t('back'), accelerator: 'Alt+Left', click: () => { if(wc.navigationHistory.canGoBack())wc.navigationHistory.goBack(); } },
      { label: t('forward'), accelerator: 'Alt+Right', click: () => { if(wc.navigationHistory.canGoForward())wc.navigationHistory.goForward(); } },
      { label: t('reload'), accelerator: 'CmdOrCtrl+R', click: reload },
      { label: t('settings'), accelerator: 'CmdOrCtrl+,', click: () => window.webContents.send('samani:command','settings') },
      { type: 'separator' }, { label:t('quit'), click: () => { quitting=true;app.quit(); } }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate([{ label:'Anime Samani',submenu:items },{label:t('view'),submenu:[{label:t('cinema'),accelerator:'CmdOrCtrl+Shift+F',click:()=>{cinema=!cinema;send();}},{role:'togglefullscreen',label:t('fullscreen'),accelerator:'F11'},{label:t('zoomIn'),click:()=>wc.setZoomLevel(Math.min(3,wc.getZoomLevel()+.5))},{label:t('zoomOut'),click:()=>wc.setZoomLevel(Math.max(-2,wc.getZoomLevel()-.5))}]},{label:t('help'),submenu:[{label:t('downloads'),click:()=>shell.openExternal(`${repository}/releases`)},{label:t('report'),click:()=>shell.openExternal(`${repository}/issues/new/choose`)},{label:t('about'),click:()=>window.webContents.send('samani:command','about')}]}]));
    if (tray) tray.setContextMenu(Menu.buildFromTemplate([{label:'Anime Samani',click:()=>window.show()},{label:t('settings'),click:()=>{window.show();window.webContents.send('samani:command','settings');}},{type:'separator'},{label:t('quit'),click:()=>{quitting=true;app.quit();}}]));
  }
  const safeExternal = url => { if (/^https:\/\//.test(url)) shell.openExternal(url).catch(()=>{}); };
  wc.on('will-navigate', (event,url) => { const migrated=migrateSiteUrl(url);if(migrated!==url){event.preventDefault();navigate(migrated);}else if(!isSiteUrl(url)){event.preventDefault();safeExternal(url);} });
  wc.on('will-redirect', (event,url) => { if(!isSiteUrl(url)){event.preventDefault();safeExternal(url);} });
  wc.setWindowOpenHandler(({url})=>{if(isSiteUrl(url))navigate(url);return {action:'deny'};});
  wc.on('will-attach-webview', event=>event.preventDefault());
  wc.on('did-start-navigation',(_event,url,_inPlace,isMainFrame)=>{if(isMainFrame&&isSiteUrl(url)){error=null;loading=true;page={title:'Anime Sama',url,episode:'',season:'',language:'',playing:false};restoredKey='';scheduleRpc();visibility();send();}});
  wc.on('did-finish-load',()=>{loading=false;applyWebsite();if(pendingResume&&pendingResume.url===wc.getURL()){wc.send('samani:resume-episode',pendingResume.episode);pendingResume=null;}send();});
  wc.on('dom-ready',applyWebsite);
  wc.on('media-started-playing',()=>{page.playing=true;scheduleRpc();send();});
  wc.on('media-paused',()=>{page.playing=false;scheduleRpc();send();});
  wc.on('render-process-gone',()=>{error={kind:'network',code:'RENDERER_EXIT',description:t('rendererExit'),url:page.url};visibility();send();});
  const validPage = event => !wc.isDestroyed() && event.senderFrame && event.sender === wc && event.senderFrame === wc.mainFrame && isSiteUrl(event.senderFrame.url);
  ipcMain.on('samani:page',(event,data)=>{
    if(!validPage(event)||!data||!isSiteUrl(data.url))return;
    const string = value=>String(value||'').replace(/[\x00-\x1f]/g,'').slice(0,240);
    if(page.episode!==string(data.episode)){page={...page,time:undefined,duration:undefined,playing:false};}
    page={...page,url:data.url,title:string(data.title)||'Anime Sama',episode:string(data.episode),season:string(data.season),language:string(data.language),episodeTitle:string(data.episodeTitle),image:/^https:\/\//.test(data.image||'')?String(data.image).slice(0,1000):''};
    if(new URL(page.url).pathname.startsWith('/catalogue/')&&page.episode&&!error){
      const entry={url:page.url,title:page.title,episode:page.episode,updatedAt:Date.now()};
      libraryStore.set('recent',[entry,...libraryStore.get('recent',[]).filter(x=>x.url!==entry.url)].slice(0,40));
    }
    scheduleRpc();send();
  });
  const playbackTimer=setInterval(async()=>{
    if(sampling||wc.isDestroyed()||!isSiteUrl(wc.getURL())||!new URL(page.url).pathname.startsWith('/catalogue/'))return;
    sampling=true;const observedUrl=page.url;
    try{const sample=await sampleFrames(wc);if(!sample||observedUrl!==page.url)return;
      const key=progressKey(page),v=sample.value;const saved=progress.get(key);
      if(restoredKey!==key){restoredKey=key;if(saved&&saved.time>10&&saved.time<saved.duration-15&&v.time<5){await seekFrame(sample.frame,saved.time);return;}}
      page={...page,time:v.time,duration:v.duration,rate:v.rate,playing:!v.paused};
      if(v.time>2)progress.set(key,{time:v.time,duration:v.duration,updatedAt:Date.now()});
      scheduleRpc();send();
    }catch{}finally{sampling=false;}
  },3000);playbackTimer.unref();
  handleFavorites();
  function handleFavorites(){ipcMain.on('samani:site-favorite',(event,data)=>{if(!validPage(event)||!data||!isSiteUrl(data.url))return;const items=libraryStore.get('favorites',[]).filter(item=>item.url!==data.url);if(data.added===true)items.unshift({url:data.url,title:String(data.title||'Anime Sama').slice(0,240),updatedAt:Date.now()});libraryStore.set('favorites',items.slice(0,100));send();});}
  const desktopUrl = pathToFileURL(join(__dirname,'desktop/index.html')).href;
  const trusted = event => !window.isDestroyed() && !window.webContents.isDestroyed() && event.sender===window.webContents && event.senderFrame && event.senderFrame===window.webContents.mainFrame && event.senderFrame.url.split('#')[0]===desktopUrl;
  const handle=(channel,callback)=>ipcMain.handle(channel,(event,...args)=>{if(!trusted(event))throw new Error('Untrusted desktop request');return callback(...args);});
  handle('samani:bootstrap',()=>state());
  handle('samani:update',action=>updates.action(action));
  handle('samani:navigate',route=>{
    if(route==='resume'){const item=libraryStore.get('recent',[]).find(item=>item.episode);if(!item)return false;pendingResume=item;return navigate(item.url);}
    const routes={home:SITE_URL,catalogue:`${SITE_URL}/catalogue/`,planning:`${SITE_URL}/planning/`,profile:`${SITE_URL}/profil/`,help:`${SITE_URL}/aide/`};
    return navigate(routes[route]||(isSiteUrl(route)?route:SITE_URL));
  });
  handle('samani:panel',value=>{panel=value===true;visibility();});
  handle('samani:action',action=>{
    if(action==='back'&&wc.navigationHistory.canGoBack())wc.navigationHistory.goBack();
    else if(action==='forward'&&wc.navigationHistory.canGoForward())wc.navigationHistory.goForward();
    else if(action==='reload')reload();
    else if(action==='browser')safeExternal(error?.url||page.url||SITE_URL);
    else if(action==='cinema'){cinema=!cinema;send();}
    else if(action==='intro-done'){intro=false;visibility();}
    else if(action==='fullscreen')window.setFullScreen(!window.isFullScreen());
    else if(action==='source')safeExternal(repository);
    else if(action==='alex')safeExternal('https://github.com/AlexAnimateMp4/anime-sama-fr-desktop');
    else if(action==='raphael')safeExternal('https://github.com/raphael-as/anime-sama-fr-desktop');
    else if(action==='discord-portal')safeExternal('https://discord.com/developers/applications');
    else if(action==='downloads')safeExternal(`${repository}/releases`);
    else if(action==='report')safeExternal(`${repository}/issues/new/choose`);
  });
  handle('samani:preferences',patch=>{
    if(!patch||typeof patch!=='object'||Array.isArray(patch))return state();
    const previous=preferences;
    // Only the native media picker can grant a new background file.
    const {media,...safePatch}=patch;
    preferences=sanitize(safePatch,preferences);config.set('preferences',preferences);
    window.setAlwaysOnTop(preferences.alwaysOnTop);
    if(!preferences.rememberWindow)config.delete('window');
    if(preferences.startAtLogin!==previous.startAtLogin && ['win32','darwin'].includes(process.platform))app.setLoginItemSettings({openAtLogin:preferences.startAtLogin});
    if(preferences.language!==previous.language)setMenu();
    applyWebsite();updateRpc();send();return state();
  });
  handle('samani:media',async kind=>{
    if(!['image','video'].includes(kind))return state();
    const result=await dialog.showOpenDialog(window,{title:t('chooseMedia'),properties:['openFile'],filters:[{name:t(kind),extensions:kind==='video'?['mp4','webm']:['png','jpg','jpeg','webp']}]});
    if(result.canceled)return state();
    const source=result.filePaths[0];const extension=extname(source).toLowerCase();
    if(!(kind==='video'?['.mp4','.webm']:['.png','.jpg','.jpeg','.webp']).includes(extension))throw new Error(t('invalidMedia'));
    if(statSync(source).size>250*1024*1024)throw new Error(t('mediaTooLarge'));
    const id=randomBytes(16).toString('hex')+extension;copyFileSync(source,join(mediaDir,id));
    preferences=sanitize({...preferences,media:id,background:kind});config.set('preferences',preferences);send();return state();
  });
  handle('samani:library',(action,url)=>{
    if(action==='clear-recent')libraryStore.set('recent',[]);
    else if(action==='favorite'){
      const target=isSiteUrl(url)?url:page.url;
      const favorites=libraryStore.get('favorites',[]);const exists=favorites.some(item=>item.url===target);
      libraryStore.set('favorites',exists?favorites.filter(item=>item.url!==target):[{url:target,title:page.title,updatedAt:Date.now()},...favorites].slice(0,100));
    }
    if(action==='favorite'&&(!url||url===wc.getURL())&&isSiteUrl(wc.getURL()))wc.send('samani:favorite-request',{url:page.url,added:libraryStore.get('favorites',[]).some(item=>item.url===page.url)});
    send();return state();
  });
  ipcMain.on('samani:bounds',(event,value)=>{
    if(!trusted(event)||!value||!['x','y','width','height'].every(key=>Number.isFinite(value[key])))return;
    const [width,height]=window.getContentSize();
    const x=Math.max(0,Math.min(width,Math.round(value.x))),y=Math.max(0,Math.min(height,Math.round(value.y)));
    bounds={x,y,width:Math.max(0,Math.min(width-x,Math.round(value.width))),height:Math.max(0,Math.min(height-y,Math.round(value.height)))};visibility();
  });
  const keyboard=(event,input)=>{
    if(input.type!=='keyDown')return;
    const key=input.key.toLowerCase();const control=input.control||input.meta;
    if(control&&key==='k'){event.preventDefault();window.webContents.send('samani:command','quick');}
    if(key==='escape'&&cinema){cinema=false;send();}
  };
  wc.on('before-input-event',keyboard);window.webContents.on('before-input-event',keyboard);
  window.webContents.on('will-navigate',event=>event.preventDefault());window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  window.on('resize',()=>{if(preferences.rememberWindow&&!window.isFullScreen())config.set('window',window.getNormalBounds());});
  window.on('close',event=>{if(preferences.minimizeToTray&&!quitting){event.preventDefault();window.hide();}});
  window.on('closed',()=>{clearTimeout(rpcTimer);clearInterval(playbackTimer);presence.stop();tray?.destroy();if(!wc.isDestroyed())wc.close();});
  try{tray=new Tray(join(__dirname,'icon.png'));tray.setToolTip('Anime Samani');tray.on('double-click',()=>window.show());}catch{/* A tray service is optional on Linux. */}
  setMenu();
  await window.loadFile(join(__dirname,'desktop/index.html'));ready=true;send();window.show();
  // Never let a stuck renderer or slow network trap the user in the intro.
  const introFallback=setTimeout(()=>{intro=false;visibility();},preferences.reducedMotion?300:3000);introFallback.unref();
  updateRpc();navigate(SITE_URL);
  app.on('second-instance',()=>{window.show();window.focus();});
  app.on('activate',()=>window.show());
  app.on('before-quit',()=>{quitting=true;});
};
if(app.requestSingleInstanceLock())startup().catch(error=>{console.error(error);app.exit(1);});else app.quit();
app.on('window-all-closed',()=>app.quit());
