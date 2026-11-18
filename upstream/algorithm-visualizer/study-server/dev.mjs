import { server } from './server.mjs';
import { createServer } from 'vite';
server.listen(4174,'127.0.0.1');
const vite=await createServer();await vite.listen();vite.printUrls();
async function shutdown(){await vite.close();server.close();process.exit();}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
