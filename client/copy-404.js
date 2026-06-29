import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distIndex = path.resolve(__dirname, 'dist', 'index.html');
const dist404 = path.resolve(__dirname, 'dist', '404.html');

try {
  if (fs.existsSync(distIndex)) {
    fs.copyFileSync(distIndex, dist404);
    console.log('Successfully copied dist/index.html to dist/404.html');
  } else {
    console.error('dist/index.html not found! Make sure vite build ran first.');
  }
} catch (error) {
  console.error('Error copying index.html to 404.html:', error);
}
