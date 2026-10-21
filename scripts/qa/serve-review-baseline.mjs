import { createServer } from "../../apps/frontend-user/node_modules/vite/dist/node/index.js";
import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
const root=process.cwd(),revision="81b14f50";
const server=await createServer({root:path.join(root,"apps/frontend-user"),configFile:path.join(root,"apps/frontend-user/vite.config.js"),cacheDir:path.join(root,".cache/template-review-baseline-vite"),
  plugins:[{name:"frozen-review-baseline",enforce:"pre",load(id){
    const relative=path.relative(root,id.split("?")[0]).replaceAll("\\","/");
    if(relative.startsWith("apps/frontend-user/src/") && /\.(jsx?|css)$/.test(relative))
      return execFileSync("git",["show",`${revision}:${relative}`],{cwd:root,encoding:"utf8",maxBuffer:5000000});
  }}],server:{host:"127.0.0.1",port:5185,strictPort:true},logLevel:"error"});
await server.listen();
console.log(`Frozen application source ${revision} at http://127.0.0.1:5185`);
