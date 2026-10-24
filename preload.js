// SPDX-License-Identifier: MPL-2.0
// Read-only page observation; the website receives no native desktop API.
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
      const season = parts.find(part=>/^saison\d+/i.test(part))?.replace(/^saison/i, 'S') || '';
      ipcRenderer.send('samani:page', { url:location.href,title,episode,season,language:parts.find(part=>/^(vf|vostfr|vo)$/i.test(part))?.toUpperCase() || '',image:document.querySelector('meta[property="og:image"]')?.content || '' });
    }, 180);
  };
  addEventListener('DOMContentLoaded', () => {
    report(); document.addEventListener('change', report, true);
    const observer = new MutationObserver(report);
    observer.observe(document.head,{childList:true,subtree:true,characterData:true});
    const episode=document.querySelector('#savedEpisodeId,#savedChapitreId'); if(episode)observer.observe(episode,{childList:true,subtree:true});
  });
  addEventListener('popstate', report);
}
