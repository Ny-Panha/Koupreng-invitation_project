import pathlib, subprocess, xml.etree.ElementTree as E, json
HERE=pathlib.Path(__file__).resolve().parent
ROOT=HERE.parents[3]
p=ROOT/'apps/backend/target/surefire-reports/TEST-com.koupreng.backend.auth.application.AuthServiceTests.xml'
props={a.get('name'):a.get('value')for a in E.parse(p).getroot().findall('./properties/property')}
java=pathlib.Path(props['java.home'])/'bin/java.exe'
result=subprocess.run([str(java),'--class-path',props['java.class.path'],str(HERE/'PasswordEncoderProbe.java')],capture_output=True,text=True,encoding='utf-8',errors='replace')
data={'scope':'Standalone installed BCrypt encoder, fictional generated strings, no service/network/account mutation','java':str(java),'exitCode':result.returncode,'results':result.stdout.splitlines(),'stderr':result.stderr,'source':'apps/backend/src/main/java/com/koupreng/backend/shared/config/SecurityConfig.java:312'}
(HERE/'password-encoder-probe.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(data,ensure_ascii=False));raise SystemExit(result.returncode)
