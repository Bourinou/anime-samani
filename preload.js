// SPDX-License-Identifier: MPL-2.0
// Page metadata and limited favorite/episode controls; no native API is exposed.
const { ipcRenderer } = require('electron');
if (process.isMainFrame && location.protocol === 'https:' && ['anime-sama.to', 'www.anime-sama.to'].includes(location.hostname)) {
  let timer;
  const report = () => {
    clearTimeout(timer); timer = setTimeout(() => {
      const text = selectors => { for(const selector of selectors){const element=document.querySelector(selector);if(element){const value=element.tagName==='SELECT'?element.selectedOptions[0]?.textContent:element.textContent;if(value?.trim())return value.trim();}}return ''; };
      const parts = location.pathname.split('/').filter(Boolean);
      const slug = parts[0]==='catalogue' ? parts[1] : '';
      const title = text(['h1','#titreOeuvre','.asn-title']) || document.title.split('|')[0].trim() || slug;
      const episode = text(['#selectEpisodes','#select_episodes','select[name*="episode"]','#savedEpisodeId','#savedChapitreId']);
      const anime=Boolean(slug&&!parts.some(part=>/^(scan|scans|manga|chapitre)/i.test(part))&&(document.querySelector('#selectEpisodes,#select_episodes,select[name*="episode"]')||[...document.querySelectorAll('a[href]')].some(a=>{const path=new URL(a.href).pathname;return path.startsWith('/catalogue/'+slug+'/')&&/\/(saison\d+|film|oav)/i.test(path);})));
      const season = parts.find(part=>/^saison\d+/i.test(part))?.replace(/^saison/i, 'S') || '';
      ipcRenderer.send('samani:page', { url:location.href,title,episode,season,anime,language:parts.find(part=>/^(vf|vostfr|vo)$/i.test(part))?.toUpperCase() || '',episodeTitle:document.querySelector('#episodeTitle,.episode-title')?.textContent||episode.replace(/^(?:épisode|episode|ep)\s*\d+(?:[.,]\d+)?\s*[-:–]?\s*/i,''),image:document.querySelector('#coverOeuvre,img.cover,.asn-cover img')?.src || (document.querySelector('meta[property="og:image"]')?.content?.includes('/contenu/')?document.querySelector('meta[property="og:image"]').content:'') || (slug?'https://cdn.jsdelivr.net/gh/Anime-Sama/IMG@img/contenu/'+encodeURIComponent(slug)+'.jpg':'') });
    }, 180);
  };
  addEventListener('DOMContentLoaded', () => {
    report(); document.addEventListener('change', report, true);
    const observer = new MutationObserver(report);
    observer.observe(document.head,{childList:true,subtree:true,characterData:true});
    const metadataObserver=new MutationObserver(records=>{if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches('h1,select,img,a[href]')||node.querySelector('h1,select,#coverOeuvre,a[href*="saison"]')))))report();});
    if(document.body)metadataObserver.observe(document.body,{childList:true,subtree:true});
    const episode=document.querySelector('#savedEpisodeId,#savedChapitreId'); if(episode)observer.observe(episode,{childList:true,subtree:true});
  });
  ipcRenderer.on('samani:resume-episode',(_event,episode)=>{const select=document.querySelector('#selectEpisodes,#select_episodes,select[name*="episode"]');if(!select)return;const option=[...select.options].find(option=>option.textContent.trim()===episode);if(option){select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));report();}});
  addEventListener('popstate', report);
}
if(process.isMainFrame&&location.protocol==='https:'&&['anime-sama.to','www.anime-sama.to'].includes(location.hostname)){
 const favoriteButton=()=>document.querySelector('#addFavoris,[data-action="favorite"],button[aria-label*="favori" i]');
 const active=button=>{const mark=button?.querySelector('#checkedFavoris');return button?.getAttribute('aria-pressed')==='true'||Boolean(mark&&!mark.hidden&&getComputedStyle(mark).display!=='none'&&getComputedStyle(mark).visibility!=='hidden');};
 document.addEventListener('click',event=>{const button=favoriteButton();if(button&&button.contains(event.target))setTimeout(()=>ipcRenderer.send('samani:site-favorite',{url:location.href,title:document.querySelector('h1')?.textContent||document.title,added:active(button)}),300);},true);
 ipcRenderer.on('samani:favorite-request',(_event,data)=>{if(data.url!==location.href)return;const button=favoriteButton();if(button&&active(button)!==data.added)button.click();});
}
