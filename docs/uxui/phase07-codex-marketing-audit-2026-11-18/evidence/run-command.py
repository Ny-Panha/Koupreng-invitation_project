import subprocess,sys,time,json,os
from pathlib import Path
p=Path("output/phase07-codex-2026-11-18"); key=sys.argv[1]; args=sys.argv[2:]; start=time.time(); env=os.environ.copy()
if "build" in args and "apps/frontend-admin" in args: env["VITE_USER_APP_URL"]="http://127.0.0.1:4173"
if args[0]=="npm": args[0]="npm.cmd"
with (p/(key+".log")).open("w",encoding="utf-8") as log:
 result=subprocess.run(args,stdout=log,stderr=subprocess.STDOUT,env=env)
row={"id":key,"command":subprocess.list2cmdline(sys.argv[2:]),"exitCode":result.returncode,"elapsedSeconds":round(time.time()-start,2),"sourceSha":subprocess.check_output(["git","rev-parse","HEAD"]).decode().strip(),"log":str(p/(key+".log")),"adminBuildOrigin":env.get("VITE_USER_APP_URL") if "build" in args and "apps/frontend-admin" in args else None}
(p/(key+".result.json")).write_text(json.dumps(row,indent=2),encoding="utf-8"); print(json.dumps(row)); print((p/(key+".log")).read_text(encoding="utf-8")[-1800:]);sys.exit(result.returncode)
