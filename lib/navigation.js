// SPDX-License-Identifier: MPL-2.0
// Fork maintenance: Just A Jad. Original application: AlexAnimateMp4.
const SITE_URL = 'https://anime-sama.to';
function isSiteUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && ['anime-sama.to', 'www.anime-sama.to'].includes(url.hostname) && !url.port && !url.username && !url.password;
    } catch { return false; }
}
function migrateSiteUrl(value) {
    try {
        const url = new URL(value);
        if (['http:', 'https:'].includes(url.protocol) && ['anime-sama.fr', 'www.anime-sama.fr'].includes(url.hostname)) {
            return `${SITE_URL}${url.pathname}${url.search}${url.hash}`;
        }
    } catch { /* The caller handles invalid input. */ }
    return value;
}
function isAborted(error) {
    return error?.errno === -3 || error?.code === 'ERR_ABORTED' || /\bERR_ABORTED\b/.test(error?.message || '');
}
// Install before the first request so startup and later link clicks are covered.
function installNavigation(webContents, onFailure) {
    let lastUrl = SITE_URL;
    let showingError = false;
    let generation = 0;
    function fail(failure) {
        if (showingError || webContents.isDestroyed()) return;
        showingError = true;
        onFailure({ ...failure, url: failure.url || lastUrl });
    }
    webContents.on('did-start-navigation', (_event, url, _inPlace, isMainFrame) => {
        if (isMainFrame && isSiteUrl(url)) {
            lastUrl = url;
            showingError = false;
            generation++;
        }
    });
    webContents.on('did-fail-load', (_event, code, description, url, isMainFrame) => {
        if (!isMainFrame || !isSiteUrl(url) || code === -3) return;
        fail({ kind: 'network', code: String(code), description, url });
    });
    webContents.on('did-navigate', (_event, url, status, statusText) => {
        if (isSiteUrl(url) && status >= 400) {
            fail({ kind: 'http', code: String(status), description: statusText || `HTTP ${status}`, url });
        }
    });
    const navigation = {
        retry() { return navigation.load(lastUrl); },
        async load(value) {
            const url = migrateSiteUrl(value);
            if (!isSiteUrl(url)) throw new Error('Only Anime Sama HTTPS pages can load inside the app.');
            lastUrl = url;
            showingError = false;
            generation++;
            let promise;
            try { promise = webContents.loadURL(url); }
            catch (error) { promise = Promise.reject(error); }
            const activeGeneration = generation;
            try { await promise; return !showingError; }
            catch (error) {
                if (!isAborted(error) && activeGeneration === generation) {
                    fail({ kind: 'network', code: String(error.code || error.errno || 'LOAD_FAILED'), description: error.message || 'The page could not be loaded.', url });
                }
                return false;
            }
        }
    };
    return navigation;
}
module.exports = { SITE_URL, isSiteUrl, migrateSiteUrl, isAborted, installNavigation };
