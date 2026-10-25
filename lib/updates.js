// SPDX-License-Identifier: MPL-2.0
function installUpdates(app,window,notify,getLanguage=()=> 'fr'){
 let state={status:'unsupported'},updater;
 // The V1 rebuild supersedes earlier preview packages, even when they have a larger version number.
 const minimumReleaseDate=Date.parse('2026-10-25T12:44:00Z');
 if(process.platform==='win32'&&app.isPackaged&&!process.env.PORTABLE_EXECUTABLE_FILE){
  updater=require('electron-updater').autoUpdater;updater.autoDownload=false;updater.autoInstallOnAppQuit=false;updater.allowPrerelease=false;
  const set=(status,extra={})=>{state={status,...extra};notify();};
  updater.on('checking-for-update',()=>set('checking'));
  updater.on('update-available',info=>{if(Date.parse(info.releaseDate)<minimumReleaseDate){set('current');return;}set('available',{version:info.version});const {dialog}=require('electron');const texts={fr:['Une mise à jour est disponible','Télécharger','Plus tard'],en:['An update is available','Download','Later'],ja:['更新があります','ダウンロード','後で']}[getLanguage()]||['An update is available','Download','Later'];dialog.showMessageBox(window,{type:'info',message:texts[0],detail:info.version,buttons:texts.slice(1),cancelId:1}).then(result=>{if(result.response===0)updater.downloadUpdate().catch(()=>{});});});
  updater.on('update-not-available',()=>set('current'));
  updater.on('download-progress',p=>set('downloading',{percent:Math.round(p.percent)}));
  updater.on('update-downloaded',()=>set('downloaded'));
  updater.on('error',()=>set('error'));
  const timer=setTimeout(()=>updater.checkForUpdates().catch(()=>{}),15000);timer.unref();
 }
 return {state:()=>state,async action(action){if(!updater)return state;if(action==='check')await updater.checkForUpdates().catch(()=>{});if(action==='download'&&state.status==='available')await updater.downloadUpdate().catch(()=>{});if(action==='install'&&state.status==='downloaded'){app.emit('before-quit');updater.quitAndInstall(false,true);}return state;}};
}
module.exports={installUpdates};
