
const fs = require('fs');
const path = require('path');

// Estos valores son los que vemos en los logs del usuario
const projectRoot = 'C:/Users/msole/Documents/Proyectos/MyLaragon';
const basePathFromShim = 'C:/Users/msole/Documents/Proyectos/MyLaragon/neutralino';

const type = 'apache';
const version = '2.4.66';
const exeName = 'httpd.exe';

const baseCandidates = [
  basePathFromShim,
  '.',
  '..',
  './neutralino',
];

const rootsToSearch = [];
for (const b of baseCandidates) {
  const nb = b.replace(/[\\\/]+/g, '/').replace(/\/$/, '');
  rootsToSearch.push(`${nb}/bin/${type}/${version}`);
  rootsToSearch.push(`${nb}/neutralino/bin/${type}/${version}`);
}

const patternsToTry = ['', 'bin', 'Apache24/bin'];

console.log('--- TEST DE DETECCIÓN REPRODUCER ---');
console.log('Base Path from Shim:', basePathFromShim);

let found = false;
for (const root of rootsToSearch) {
  // El shim usa fileExists que en el proxy hace path.resolve(process.cwd(), filePath)
  // Aquí simulamos eso.
  const absRoot = path.resolve(projectRoot, root); 
  const rootExists = fs.existsSync(absRoot);
  
  if (absRoot.includes('bin/apache')) {
    console.log(`Verificando raíz: ${absRoot} -> Existe: ${rootExists}`);
  }

  if (!rootExists) continue;

  for (const pattern of patternsToTry) {
    const candidate = path.join(absRoot, pattern, exeName);
    const exists = fs.existsSync(candidate);
    console.log(`  Probando: ${candidate} -> Encontrado: ${exists}`);
    if (exists) {
      console.log(`  >>> ¡ÉXITO!: ${candidate}`);
      found = true;
      break;
    }
  }
  if (found) break;
}

if (!found) {
  console.log('--- NO ENCONTRADO ---');
  console.log('Listando contenido de la carpeta de la versión para depurar:');
  const versionDir = path.join(basePathFromShim, 'bin/apache', version);
  if (fs.existsSync(versionDir)) {
      console.log(`Contenido de ${versionDir}:`, fs.readdirSync(versionDir));
      const sub = path.join(versionDir, 'Apache24');
      if (fs.existsSync(sub)) {
           console.log(`Contenido de ${sub}:`, fs.readdirSync(sub));
      }
  } else {
      console.log('La carpeta de la versión no existe en la ruta esperada.');
  }
}
