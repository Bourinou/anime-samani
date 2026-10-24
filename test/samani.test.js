const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { readFileSync } = require('node:fs');
const { sanitize,defaults,websiteCss } = require('../lib/preferences');
const { Decoder,encode,Presence,buildActivity } = require('../lib/presence');

test('French and English cover every desktop label and the same complete vocabulary',()=>{
 const fr=require('../desktop/i18n/fr.json'),en=require('../desktop/i18n/en.json');
 assert.deepEqual(Object.keys(fr).sort(),Object.keys(en).sort());
 const html=readFileSync('desktop/index.html','utf8');
 for(const match of html.matchAll(/data-(?:i18n|title|placeholder)="([^"]+)"/g))assert.ok(fr[match[1]]&&en[match[1]],match[1]);
 assert.equal(defaults.language,'fr');
});
test('theme inputs cannot inject CSS or grant local files',()=>{
 const p=sanitize({colorA:'red;url(file:///etc/passwd)',media:'../../secret',blur:999,brightness:-5,language:'xx',surface:NaN});
 assert.equal(p.colorA,defaults.colorA);assert.equal(p.media,null);assert.equal(p.blur,40);assert.equal(p.brightness,10);assert.equal(p.surface,defaults.surface);
 assert.doesNotMatch(websiteCss(p),/passwd/);
});
test('preference updates preserve untouched settings and validate Discord application IDs',()=>{
 const prior=sanitize({language:'en',rpcClientId:'1563568424691437578',blur:24});
 const after=sanitize({alwaysOnTop:true,rpcClientId:'token-or-script'},prior);
 assert.equal(after.language,'en');assert.equal(after.blur,24);assert.equal(after.alwaysOnTop,true);assert.equal(after.rpcClientId,'1563568424691437578');
});
test('Discord decoder handles partial Unicode frames and multiple messages in one packet',()=>{
 const a=encode(1,{evt:'READY',title:'Épisode — 呪術'}),b=encode(3,{nonce:'ping'}),decoder=new Decoder();
 assert.deepEqual(decoder.push(a.subarray(0,5)),[]);
 assert.deepEqual(decoder.push(Buffer.concat([a.subarray(5),b])),[{opcode:1,data:{evt:'READY',title:'Épisode — 呪術'}},{opcode:3,data:{nonce:'ping'}}]);
});
test('Discord decoder rejects excessive frame sizes',()=>{
 const header=Buffer.alloc(8);header.writeUInt32LE(1024*1024+1,4);assert.throws(()=>new Decoder().push(header),/Oversized/);
});
test('Discord privacy toggles remove title and episode from the payload',()=>{
 const activity=buildActivity({title:'Private title',episode:'Episode 7',season:'S2',playing:true,url:'https://anime-sama.to/catalogue/private-title/'},{...defaults,rpcShowTitle:false,rpcShowEpisode:false},100,'https://github.com/JustAJad/anime-samani');
 assert.doesNotMatch(JSON.stringify(activity),/Private title|Episode 7|S2/);assert.equal(activity.details,'Anime Samani');assert.equal(activity.timestamps.start,100);assert.equal(activity.buttons[0].url,'https://anime-sama.to/');
});
test('Discord templates, episode data and pause state produce bounded bilingual payloads',()=>{
 const activity=buildActivity({title:'A'.repeat(300),episode:'Episode 7',season:'S2',language:'VF',playing:false,url:'https://anime-sama.to/'},{...defaults,language:'en',rpcTemplate:'{title} — {episode}',rpcButtons:false},null,'https://github.com/JustAJad/anime-samani');
 assert.equal(activity.details.length,128);assert.match(activity.state,/Browsing Anime Sama/);assert.equal(activity.timestamps,undefined);assert.equal(activity.buttons,undefined);
});
test('Discord handshake waits for READY, answers ping, and clears presence on disable',()=>{
 class Socket extends EventEmitter { constructor(){super();this.destroyed=false;this.writes=[];}setTimeout(){}write(packet){this.writes.push(new Decoder().push(packet)[0]);}destroy(){this.destroyed=true;} }
 const socket=new Socket();const presence=new Presence({connect:()=>socket,platform:'win32'});
 presence.configure(true,'1563568424691437578');presence.update({details:'Anime Samani'});socket.emit('connect');
 assert.equal(socket.writes[0].opcode,0);assert.equal(socket.writes.length,1);
 socket.emit('data',encode(1,{evt:'READY'}));assert.equal(presence.status,'connected');assert.equal(socket.writes[1].data.cmd,'SET_ACTIVITY');
 socket.emit('data',encode(3,{nonce:'pong'}));assert.equal(socket.writes[2].opcode,4);
 presence.stop();assert.equal(socket.writes.at(-1).data.args.activity,null);assert.equal(socket.destroyed,true);assert.equal(presence.status,'disabled');
});
test('disabled or unconfigured Discord never attempts to open a socket',()=>{
 let attempts=0;const presence=new Presence({connect:()=>{attempts++;throw new Error('unexpected');}});
 presence.configure(false,'');presence.configure(true,'');assert.equal(presence.status,'unconfigured');assert.equal(attempts,0);presence.stop();
});
