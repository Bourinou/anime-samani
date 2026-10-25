// SPDX-License-Identifier: MPL-2.0
// Discord IPC framing replaces the original single-packet implementation.
const net = require('node:net');
const { EventEmitter } = require('node:events');
const { randomUUID } = require('node:crypto');
const { join } = require('node:path');
function encode(opcode, data) {
  const body = Buffer.from(JSON.stringify(data));
  const packet = Buffer.alloc(8 + body.length);
  packet.writeUInt32LE(opcode, 0); packet.writeUInt32LE(body.length, 4); body.copy(packet, 8);
  return packet;
}
class Decoder {
  constructor() { this.buffer = Buffer.alloc(0); }
  push(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    const frames = [];
    while (this.buffer.length >= 8) {
      const size = this.buffer.readUInt32LE(4);
      if (size > 1024 * 1024) throw new Error('Oversized Discord frame');
      if (this.buffer.length < size + 8) break;
      frames.push({ opcode: this.buffer.readUInt32LE(0), data: JSON.parse(this.buffer.subarray(8, 8 + size).toString()) });
      this.buffer = this.buffer.subarray(8 + size);
    }
    return frames;
  }
}
const clean = value => String(value || '').replace(/[\x00-\x1f]/g, '').trim().slice(0, 128);
function buildActivity(page, prefs, since, repository) {
  const fr = prefs.language === 'fr';
  const values = { title: prefs.rpcShowTitle ? clean(page.title) : 'Anime Samani', episode: prefs.rpcShowEpisode ? clean(page.episode) : '', season: prefs.rpcShowEpisode ? clean(page.season) : '', language: clean(page.language) };
  const details = clean((prefs.rpcTemplate || '{title}').replace(/\{(title|episode|season|language)\}/g, (_m,k) => values[k])) || 'Anime Samani';
  const watching = Boolean((page.playing||page.duration>0) && /\/catalogue\//.test(page.url||''));
  const labels = prefs.language==='ja'?{browse:'Anime Sama を閲覧中',play:'再生中'}:{browse:fr?'Navigation sur Anime Sama':'Browsing Anime Sama',play:fr?'En lecture':'Playing'};
  const season = values.season.replace(/[^0-9]/g,'');
  const episode = values.episode.match(/\d+(?:[.,]\d+)?/)?.[0];
  const stateText = watching ? [prefs.rpcShowEpisode?clean(page.episodeTitle):'', season?'S'+season:'', episode?'EP'+episode:'',values.language].filter(Boolean).join(' · ') : labels.browse;
  const activity = { type: watching?3:0, details: watching?details.padEnd(2,' '):labels.browse, state: clean(stateText||labels.play).padEnd(2,' ') };
  const logo = `${repository.replace('https://github.com/', 'https://raw.githubusercontent.com/')}/b31b5d598c660a2eacff336724fd769aeb210cfb/assets/branding/app-mark.png`;
  activity.assets = { large_image:watching&&prefs.rpcShowTitle&&/^https:\/\//.test(page.image||'')?page.image:logo,large_text:watching&&prefs.rpcShowTitle?values.title:'Anime Samani' };
  if(watching){
    if(page.playing&&Number.isFinite(page.time)&&Number.isFinite(page.duration)&&page.duration>page.time&&page.rate>0){const now=Date.now();activity.timestamps={start:Math.round(now-page.time/page.rate*1000),end:Math.round(now+(page.duration-page.time)/page.rate*1000)};}
  } else if(since) activity.timestamps={start:since};
  if (prefs.rpcButtons) activity.buttons = [ { label: prefs.language==='ja'?'Anime Sama を開く':fr?'Ouvrir Anime Sama':'Open Anime Sama', url: prefs.rpcShowTitle ? page.url || 'https://anime-sama.to/' : 'https://anime-sama.to/' }, { label: 'Anime Samani', url: repository } ];
  return activity;
}
class Presence extends EventEmitter {
  constructor({ connect = net.createConnection, platform = process.platform, environment = process.env } = {}) {
    super(); this.connect = connect; this.platform = platform; this.environment = environment;
    this.status = 'disabled'; this.enabled = false; this.socket = null; this.timer = null; this.attempt = 0; this.latest = null; this.ready = false; this.epoch = 0; this.lastSent = 0; this.sendTimer = null;
  }
  statusTo(value) { this.status = value; this.emit('status', value); }
  configure(enabled, clientId) {
    if (this.enabled === enabled && this.clientId === clientId) return;
    this.stop(); this.clientId = clientId; this.enabled = enabled;
    if (!enabled) return;
    if (!/^\d{16,22}$/.test(clientId)) return this.statusTo('unconfigured');
    this.attempt = 0; this.open();
  }
  update(activity) {
    this.latest = activity; if (!this.ready) return;
    clearTimeout(this.sendTimer);
    const delay = Math.max(0, 5000 - (Date.now() - this.lastSent));
    if (!delay) this.sendActivity();
    else { this.sendTimer = setTimeout(() => this.sendActivity(), delay); this.sendTimer.unref?.(); }
  }
  sendActivity() {
    clearTimeout(this.sendTimer); this.lastSent = Date.now();
    this.write(1, { cmd: 'SET_ACTIVITY', args: { pid: process.pid, activity: this.latest }, nonce: randomUUID() });
  }
  write(opcode, body) { if (this.socket && !this.socket.destroyed) this.socket.write(encode(opcode, body)); }
  open(slot = 0, epoch = this.epoch) {
    if (!this.enabled || epoch !== this.epoch) return;
    this.statusTo('connecting'); this.ready = false;
    const path = this.platform === 'win32' ? `\\\\.\\pipe\\discord-ipc-${slot}` : join(this.environment.XDG_RUNTIME_DIR || this.environment.TMPDIR || '/tmp', `discord-ipc-${slot}`);
    const socket = this.connect({ path }); this.socket = socket;
    const decoder = new Decoder(); let failed = false;
    const unavailable = () => {
      if (failed || epoch !== this.epoch) return; failed = true; this.ready = false; socket.destroy();
      if (!this.enabled) return;
      if (slot < 9) return this.open(slot + 1, epoch);
      this.statusTo('unavailable');
      this.timer = setTimeout(() => this.open(0, epoch), Math.min(30000, 5000 * ++this.attempt)); this.timer.unref?.();
    };
    socket.setTimeout(1200, unavailable);
    socket.on('connect', () => this.write(0, { v: 1, client_id: this.clientId }));
    socket.on('data', chunk => {
      if (failed || epoch !== this.epoch) return;
      try {
        for (const frame of decoder.push(chunk)) {
          if (frame.opcode === 3) this.write(4, frame.data);
          else if (frame.opcode === 2) unavailable();
          else if (frame.data.evt === 'READY') { this.ready = true; this.attempt = 0; socket.setTimeout(0); this.statusTo('connected'); this.sendActivity(); }
          else if (frame.data.evt === 'ERROR') this.statusTo('error');
        }
      } catch { unavailable(); }
    });
    socket.on('error', unavailable); socket.on('close', unavailable);
  }
  stop() {
    this.enabled = false; this.epoch++; clearTimeout(this.timer); clearTimeout(this.sendTimer); this.timer = null;
    if (this.ready) { this.latest = null; this.sendActivity(); }
    this.ready = false; this.socket?.destroy(); this.socket = null; this.statusTo('disabled');
  }
}
module.exports = { Presence, Decoder, encode, buildActivity };
