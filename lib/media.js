// SPDX-License-Identifier: MPL-2.0
const {statSync,createReadStream}=require('node:fs');
const {extname}=require('node:path');
const {Readable}=require('node:stream');
const types={'.mp4':'video/mp4','.webm':'video/webm','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'};
function serveMedia(file,request){
 const size=statSync(file).size,headers={'Accept-Ranges':'bytes','Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'};
 if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
 let start=0,end=size-1,status=200;
 const range=request.headers.get('range');
 if(range){const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m||(!m[1]&&!m[2]))return new Response(null,{status:416,headers:{...headers,'Content-Range':`bytes */${size}`}});
  if(!m[1])start=Math.max(0,size-Number(m[2]));else start=Number(m[1]);
  if(m[1]&&m[2])end=Math.min(end,Number(m[2]));
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>end||start>=size)return new Response(null,{status:416,headers:{...headers,'Content-Range':`bytes */${size}`}});
  status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;
 }
 headers['Content-Length']=String(Math.max(0,end-start+1));
 if(request.method==='HEAD'||!size)return new Response(null,{status,headers});
 const stream=createReadStream(file,{start,end});return new Response(Readable.toWeb(stream),{status,headers});
}
module.exports={serveMedia};
