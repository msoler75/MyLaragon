import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

const folders = [
  'bin',
  'bin/apache',
  'bin/php',
  'bin/mysql',
  'bin/nginx',
  'bin/redis',
  'bin/memcached',
  'bin/mongodb',
  'bin/mailpit',
  'www',
  'etc',
  'etc/apache2',
  'etc/nginx',
  'etc/mysql',
  'data',
  'data/mysql',
  'tmp',
  'logs'
];

console.log('Initializing WebServDev folder structure...');

folders.forEach(folder => {
  const fullPath = path.join(root, folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created: ${folder}`);
  } else {
    console.log(`Exists: ${folder}`);
  }
});

// Create a basic app.ini if it doesn't exist
const iniPath = path.join(root, 'app.ini');
if (!fs.existsSync(iniPath)) {
  const defaultIni = `
[WebServDev]
version=1.0.0
path=${root.replace(/\\/g, '\\\\')}
www=${path.join(root, 'www').replace(/\\/g, '\\\\')}

[apache]
version=
documentroot=${path.join(root, 'www').replace(/\\/g, '\\\\')}

[mysql]
version=

[php]
version=
`;
  fs.writeFileSync(iniPath, defaultIni.trim());
  console.log('Created: app.ini (default)');
}

console.log('Done!');
