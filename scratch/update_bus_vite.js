const fs = require('fs');
const path = require('path');

const viteConfigPath = 'c:/Users/munun/Downloads/COLLEGE ERP/bec bus/client/vite.config.js';
const content = `import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  base: '/bus/',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../../COLLEGE ERP/campus-portal/public/bus'),
    emptyOutDir: true
  },
  server: {
    port: 5173,
    host: true,
    open: true
  }
})
`;

fs.writeFileSync(viteConfigPath, content, 'utf8');
console.log('Updated bec bus client vite.config.js successfully.');
