import fs from 'node:fs';
import { exec } from 'node:child_process';
import path from 'node:path';

const execAsync = (command) => new Promise((resolve, reject) => {
  exec(command, (error, stdout, stderr) => {
    if (error) return reject(error);
    resolve({ stdout, stderr });
  });
});

export async function downloadFile(url, dest, onLog = () => {}) {
  onLog(`Descargando de ${url}...`);
  
  // Usamos PowerShell para descargar porque maneja TLS, redirecciones y timeouts de forma nativa y robusta en Windows
  // Similar a lo que hace el shim de Neutralino para mantener consistencia.
  const psCommand = `powershell.exe -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; iwr -Uri '${url}' -OutFile '${dest}' -TimeoutSec 300"`;
  
  try {
    const { stderr } = await execAsync(psCommand);
    if (stderr && stderr.includes('Error')) {
      throw new Error(stderr);
    }
    return true;
  } catch (e) {
    onLog(`Error descargando con PowerShell: ${e.message}. Reintentando con curl...`);
    // Fallback a curl (que suele venir en Windows 10/11)
    const curlCommand = `curl -L "${url}" -o "${dest}" --fail --silent --show-error`;
    await execAsync(curlCommand);
    return true;
  }
}

export async function installFromZip({ zipPath, destDir, onLog = () => {} }) {
  onLog(`Extrayendo en ${destDir}...`);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  
  // Usamos Expand-Archive de PowerShell
  const psCommand = `powershell.exe -Command "$ProgressPreference = 'SilentlyContinue'; Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`;
  
  try {
    await execAsync(psCommand);
  } catch (e) {
    onLog(`Error con Expand-Archive: ${e.message}. Reintentando con tar...`);
    // Fallback a tar (Windows 10+ tiene tar bsdtar)
    const tarCommand = `tar -xf "${zipPath}" -C "${destDir}"`;
    await execAsync(tarCommand);
  }
  
  onLog('Extracción completada.');
  return true;
}
