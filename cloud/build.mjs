import {spawnSync} from 'node:child_process';
const cli=process.env.npm_execpath,app='upstream/algorithm-visualizer';
if(process.env.VERCEL){const r=spawnSync(process.execPath,[cli,'ci','--prefix',app],{stdio:'inherit'});if(r.status)process.exit(r.status);}
const r=spawnSync(process.execPath,[cli,'run','build','--prefix',app],{stdio:'inherit',env:{...process.env,VITE_CLOUD:'true'}});process.exit(r.status??1);
