import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'photo-upload-api',
        configureServer(server) {
          server.middlewares.use('/api/upload-photo', (req, res) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  const imageBase64 = data.imageBase64 || '';
                  const productKey = data.productKey || 'muscaria';
                  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
                  const buffer = Buffer.from(base64Data, 'base64');
                  
                  const pubDir = path.resolve(__dirname, 'public');
                  if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
                  const heroDir = path.resolve(pubDir, 'assets/hero');
                  if (!fs.existsSync(heroDir)) fs.mkdirSync(heroDir, { recursive: true });

                  if (productKey === 'muscaria') {
                    fs.writeFileSync(path.resolve(pubDir, 'photo_2026-09-10_04-08-38.jpg'), buffer);
                    fs.writeFileSync(path.resolve(pubDir, 'amanita-amur-package.jpg'), buffer);
                    fs.writeFileSync(path.resolve(heroDir, 'amanita-amur-package.jpg'), buffer);
                  } else {
                    fs.writeFileSync(path.resolve(pubDir, 'pantherina-batch.jpg'), buffer);
                  }

                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true }));
                } catch (e) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: String(e) }));
                }
              });
            } else {
              res.statusCode = 405;
              res.end();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
