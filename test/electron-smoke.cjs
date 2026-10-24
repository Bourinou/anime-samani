// Local fixtures exercise the real Electron window without contacting the site.
const { app, BrowserWindow, Menu, session, shell } = require('electron');
const { mkdirSync, writeFileSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const assert = require('node:assert/strict');
const root = join(__dirname, '..');
const profilePath = join(root, 'artifacts', 'smoke-profile');
rmSync(profilePath, { recursive: true, force: true });
app.setPath('userData', profilePath);
app.disableHardwareAcceleration();
let mode = 'http500';
let openedExternal;
shell.openExternal = async url => { openedExternal = url; };
const problems = [];
process.on('unhandledRejection', error => problems.push(String(error)));
process.on('uncaughtException', error => { console.error(error); app.exit(1); });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(check, label) {
    const limit = Date.now() + 20000;
    while (Date.now() < limit) {
        if (await Promise.race([Promise.resolve().then(check), delay(1000).then(() => false)])) return;
        await delay(100);
    }
    throw new Error(`Timed out: ${label}`);
}
async function main() {
    await app.whenReady();
    session.defaultSession.protocol.handle('https', request => {
        const path = new URL(request.url).pathname;
        if (mode === 'offline' || path === '/failed-frame') return Response.error();
        if (mode === 'http500') return new Response('Server failure', { status: 500, headers: { 'content-type': 'text/html' } });
        if (path === '/missing') return new Response('Missing', { status: 404, headers: { 'content-type': 'text/html' } });
        return new Response('<!doctype html><title>Fixture</title><h1 id="healthy">Anime Sama fixture</h1><a id="broken" href="/missing">Broken link</a><iframe src="/failed-frame"></iframe>', { headers: { 'content-type': 'text/html' } });
    });
    require('../index');
    let window;
    await until(() => {
        window = BrowserWindow.getAllWindows().find(item => /^(https:|file:.*error\.html)/.test(item.webContents.getURL()));
        return window;
    }, 'main window');
    const wc = window.webContents;
    for (const event of ['did-start-navigation','did-navigate','did-finish-load','did-fail-load','render-process-gone']) wc.on(event, (_event, ...args) => console.log('SMOKE', event, ...args));
    wc.on('console-message', (_event, details) => console.log('PAGE', details.message));
    const page = script => wc.executeJavaScript(script);
    await until(async () => wc.getURL().includes('error.html') && await page('document.getElementById("code")?.textContent === "HTTP 500"'), 'startup HTTP 500 recovery');
    assert.equal(window.isVisible(), true);
    assert.match(await page('document.body.innerText'), /Just A Jad/);
    assert.match(await page('document.body.innerText'), /AlexAnimateMp4/);
    assert.equal(await page('document.getElementById("retry").href'), 'https://anime-sama.to/');
    mkdirSync(join(root, 'artifacts'), { recursive: true });
    await delay(250);
    writeFileSync(join(root, 'artifacts', 'recovery-preview.png'), (await wc.capturePage()).toPNG());
    console.log('PASS startup HTTP 500, visible recovery, branding and retry URL');

    mode = 'healthy';
    await page('document.getElementById("retry").click()');
    await until(async () => wc.getURL() === 'https://anime-sama.to/' && await page('Boolean(document.getElementById("healthy"))'), 'successful retry');
    await delay(350);
    assert.equal(wc.getURL(), 'https://anime-sama.to/');
    console.log('PASS retry recovers; failed iframe leaves the main page usable');

    const Store = require('electron-store');
    const prefs = new Store({ name: 'settings', watch: true });
    const namespace = require('../package.json').exeName;
    prefs.set(`${namespace}.ALWAYS_ON_TOP`, true);
    await until(() => window.isAlwaysOnTop(), 'Always on top setting applies');
    prefs.set(`${namespace}.LANGUAGE`, 'fr');
    await delay(250);
    assert.equal(window.isAlwaysOnTop(), true);
    prefs.set(`${namespace}.ALWAYS_ON_TOP`, false);
    await until(() => !window.isAlwaysOnTop(), 'Always on top setting clears');
    prefs.set(`${namespace}.LANGUAGE`, 'en');
    prefs.set(`${namespace}.SAVE_WINDOW_SIZE`, true);
    await until(() => prefs.get(`${namespace}.WIDTH`) === window.getSize()[0], 'size saving starts');
    window.setSize(860, 600);
    await until(() => prefs.get(`${namespace}.WIDTH`) === 860 && prefs.get(`${namespace}.HEIGHT`) === 600, 'resize is saved');
    prefs.set(`${namespace}.SAVE_WINDOW_SIZE`, false);
    await until(() => !prefs.has(`${namespace}.WIDTH`) && !prefs.has(`${namespace}.HEIGHT`), 'saved dimensions are cleared');
    console.log('PASS live settings: Always on top, language independence, resize and dimension cleanup');

    await page('document.getElementById("broken").click()');
    await until(async () => wc.getURL().includes('error.html') && await page('document.getElementById("code")?.textContent === "HTTP 404"'), 'later HTTP 404');
    assert.equal(await page('document.getElementById("retry").href'), 'https://anime-sama.to/missing');
    await page('document.getElementById("browser").click()');
    await until(() => openedExternal === 'https://anime-sama.to/missing', 'open in browser action');
    console.log('PASS later HTTP 404 preserves page URL; browser action routes correctly');

    mode = 'offline';
    await page('document.getElementById("home").click()');
    await until(async () => wc.getURL().includes('error.html') && await page('document.getElementById("code")?.textContent.includes("-2")'), 'network recovery');
    assert.doesNotMatch(await page('document.getElementById("code").textContent'), /500/);
    console.log('PASS real Electron network failure is not mislabeled HTTP 500');

    mode = 'healthy';
    const reload = Menu.getApplicationMenu().getMenuItemById('app-reload');
    assert.ok(reload);
    reload.click();
    await until(async () => wc.getURL() === 'https://anime-sama.to/' && await page('Boolean(document.getElementById("healthy"))'), 'menu retry after network failure');
    console.log('PASS reload menu recovers from the error page');
    assert.deepEqual(problems, []);
    app.exit(0);
}
main().catch(error => { console.error(error); app.exit(1); });
