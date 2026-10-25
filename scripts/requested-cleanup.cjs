// SPDX-License-Identifier: MPL-2.0
// One-time cleanup explicitly requested by Jad. Does not bypass repository rules.
const {execFileSync}=require('node:child_process'),fs=require('node:fs');
const repository=process.env.GITHUB_REPOSITORY;
const api=(path,args=[])=>execFileSync('gh',['api',path,...args],{encoding:'utf8'});
if(repository!=='JustAJad/anime-samani'||JSON.parse(api('repos/'+repository)).id!==1432238651)throw new Error('Unexpected repository');
const targets=[{tag:'v1.0.0',id:423073532,sha:'e38c02b4e846897beae163452c9c5fb12642d7f4'},{tag:'v0.3.1',id:422837255,sha:'8f6915de381acf6529cc08b8bda352597a29471e'}];
const snapshot=targets.map(t=>({...t,release:JSON.parse(api(`repos/${repository}/releases/${t.id}`)),ref:JSON.parse(api(`repos/${repository}/git/ref/tags/${t.tag}`))}));
if(snapshot.some(t=>t.release.tag_name!==t.tag||t.ref.object.sha!==t.sha))throw new Error('Release/tag changed since review; no deletions made.');
fs.writeFileSync('requested-cleanup-snapshot.json',JSON.stringify(snapshot,null,2));
let failed=false;
for(const t of snapshot){
 try{api(`repos/${repository}/releases/${t.id}`,['--method','DELETE']);console.log('Deleted release '+t.tag);}catch{console.log('Could not delete release '+t.tag);failed=true;}
 try{api(`repos/${repository}/git/refs/tags/${t.tag}`,['--method','DELETE']);console.log('Deleted tag '+t.tag);}catch{console.log('Could not delete tag '+t.tag+'; repository protection may require the owner.');failed=true;}
}
if(failed)process.exitCode=1;
