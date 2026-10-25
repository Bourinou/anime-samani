// Stamp a new build version for each main-branch update, without rewriting Git history.
const fs=require('node:fs'),{execFileSync}=require('node:child_process');
const pkg=require('../package.json');
const releases=JSON.parse(execFileSync('gh',['api',`repos/${process.env.GITHUB_REPOSITORY}/releases?per_page=100`],{encoding:'utf8'}));
const parse=v=>/^v?(\d+)\.(\d+)\.(\d+)$/.exec(v)?.slice(1).map(Number);
const compare=(a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2];
const latest=releases.filter(r=>!r.draft&&!r.prerelease).map(r=>parse(r.tag_name)).filter(Boolean).sort(compare).at(-1);
let version=parse(pkg.version);if(latest&&compare(version,latest)<=0)version=[latest[0],latest[1],latest[2]+1];
pkg.version=version.join('.');fs.writeFileSync('package.json',JSON.stringify(pkg,null,2)+'\n');
const lock=require('../package-lock.json');lock.version=pkg.version;lock.packages[''].version=pkg.version;fs.writeFileSync('package-lock.json',JSON.stringify(lock,null,2)+'\n');
console.log('Build version: '+pkg.version);
