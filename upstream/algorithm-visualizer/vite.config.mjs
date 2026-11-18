import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const base=path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({plugins:[react()],resolve:{alias:{common:path.join(base,'src/common')}},css:{preprocessorOptions:{scss:{loadPaths:[path.join(base,'src')],silenceDeprecations:['import','legacy-js-api']}}},server:{host:'127.0.0.1',port:5173,strictPort:true,proxy:{'/api':'http://127.0.0.1:4174'}}});
