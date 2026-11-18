// Loopback-only static + fictional API server. Moving mocks out of Playwright
// preserves actual browser HTTP caching for the cold/warm performance series.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff','.mp4':'video/mp4','.mp3':'audio/mpeg','.m4a':'audio/mp4'};
const glob = value => new RegExp('^'+value.split('**').map(p=>p.split('*').map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('[^/]*')).join('.*')+'$');
export async function startFixtureServers(root, stage) {
  let handlers=[];
  const servers=[];
  for(const [app,port] of [['user',4173],['admin',4174]]) {
    const build=path.join(root,`output/playwright/uxui-phase06-2026-11-17/${stage}/${app}-build`);
    const server=http.createServer(async(req,res)=>{
      try {
        const url=`http://127.0.0.1:${port}${req.url}`;
        const pathname=new URL(url).pathname;
        if(pathname.startsWith('/api/')) {
          if(req.method!=='GET') { res.writeHead(405,{'Content-Type':'application/json'});res.end(JSON.stringify({message:'Read-only performance fixtures'}));return; }
          const matching=handlers.filter(h=>h.match.test(url)).reverse();
          const dispatch=async index=>{
            if(index>=matching.length) {res.writeHead(501,{'Content-Type':'application/json'});res.end(JSON.stringify({message:`Unmapped fictional API ${pathname}`}));return;}
            await matching[index].handler({
              request:()=>({url:()=>url,method:()=>req.method,headers:()=>req.headers,postDataJSON:()=>null,resourceType:()=> 'fetch'}),
              fallback:()=>dispatch(index+1),continue:()=>dispatch(index+1),abort:()=>{res.writeHead(502);res.end();},
              fulfill:async({status=200,headers={},contentType,body,json})=>{res.writeHead(status,{'Cache-Control':'no-store','Content-Type':contentType||(json?'application/json':'text/plain'),...headers});res.end(json?JSON.stringify(json):body||'');},
            });
          };
          await dispatch(0);return;
        }
        let file=path.resolve(build,'.'+decodeURIComponent(pathname));
        if(file!==build&&!file.startsWith(build+path.sep)) {res.writeHead(403);res.end();return;}
        let bytes;
        try { bytes=await fs.readFile(file); } catch {file=path.join(build,'index.html');bytes=await fs.readFile(file);}
        const type=mime[path.extname(file)]||'application/octet-stream';
        res.writeHead(200,{'Content-Type':type,'Content-Length':bytes.length,
          'Cache-Control':file.endsWith('index.html')?'no-store':'public, max-age=3600',
          'Content-Security-Policy':"default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; frame-src http://127.0.0.1:4173 http://127.0.0.1:4174; connect-src 'self'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' blob: data:"});
        res.end(bytes);
      } catch(error) {if(!res.headersSent)res.writeHead(500);res.end(error.message);}
    });
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});servers.push(server);
  }
  return {
    bind(page) {handlers=[];page.route=async(pattern,handler)=>{if(typeof pattern!=='string')throw new Error('Fixture pattern must be explicit');handlers.push({match:glob(pattern),handler});};},
    close:()=>Promise.all(servers.map(server=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);}))),
  };
}
