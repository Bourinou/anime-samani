// SPDX-License-Identifier: MPL-2.0
const data = new URLSearchParams(location.search);
for (const id of ['title', 'code', 'description', 'note', 'retry', 'home', 'browser']) {
    const text = data.get(id);
    if (text) document.getElementById(id).textContent = text;
}
// Keep remote error messages as text, never HTML or script.
function siteLink(value) {
    try {
        const url = new URL(value);
        if (url.protocol === 'https:' && ['anime-sama.to', 'www.anime-sama.to'].includes(url.host) && !url.username && !url.password) return url.href;
    } catch { /* Fall back to the current home page. */ }
    return 'https://anime-sama.to/';
}
document.getElementById('retry').href = siteLink(data.get('url'));
document.getElementById('home').href = 'https://anime-sama.to/';
document.getElementById('browser').href = siteLink(data.get('url'));
document.title = data.get('title') || 'Anime Sama.to — Just A Jad';
