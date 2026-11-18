import { command,compiler,debuggerPath } from './compiler.mjs';
for(const [name,exe]of [['C 编译器',compiler],['调试器',debuggerPath]])try{const r=await command(exe,['--version']);console.log(name+': '+r.stdout.split('\n')[0]);if(r.code)process.exitCode=1;}catch(e){console.error(name+': '+e.message);process.exitCode=1;}
console.log('Node: '+process.version+'；执行模式：本机原生，尚无容器隔离。只运行自己的可信代码。');
