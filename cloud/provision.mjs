import {Sandbox} from '@vercel/sandbox';import {readdir,readFile,writeFile} from 'node:fs/promises';
const sandbox=await Sandbox.create({name:'ds-base-'+Date.now(),runtime:'node24',resources:{vcpus:1},timeout:300000,persistent:false});
try{
  const detect=await sandbox.runCommand('sh',['-c','node --version; command -v gcc; command -v gdb; command -v dnf; command -v apt-get']);console.log(await detect.stdout());
  const install=await sandbox.runCommand({cmd:'sh',args:['-c','if command -v dnf >/dev/null; then dnf install -y gcc gdb; else apt-get update && apt-get install -y gcc gdb; fi'],sudo:true});if(install.exitCode!==0)throw new Error((await install.stderr()).slice(-1200));
  const files=await readdir('upstream/algorithm-visualizer/study-server');await sandbox.writeFiles(await Promise.all(files.filter(f=>f.endsWith('.mjs')).map(async f=>({path:'/vercel/sandbox/study-server/'+f,content:await readFile('upstream/algorithm-visualizer/study-server/'+f)}))));
  const smoke=await sandbox.runCommand('node',['--input-type=module','-e',`const {quickC,runC}=await import('/vercel/sandbox/study-server/runner.mjs');const source='int main(void){int x=1;x++;return 0;}';const r=await runC({source,profile:{kind:'free',watches:[]},entry:'main',maxSteps:20});console.log(JSON.stringify({status:r.status,steps:r.steps.length,diagnostics:r.diagnostics}));if(r.status!=='completed'||!r.steps.length)process.exit(1);`]);console.log(await smoke.stdout());if(smoke.exitCode!==0)throw new Error(await smoke.stderr());
  await sandbox.update({networkPolicy:'deny-all'});
  const snapshot=await sandbox.snapshot({expiration:0});await writeFile('.vercel/ds-snapshot.json',JSON.stringify({snapshotId:snapshot.snapshotId},null,2));console.log('snapshot='+snapshot.snapshotId);
}finally{if(sandbox.status==='running')await sandbox.stop();}
