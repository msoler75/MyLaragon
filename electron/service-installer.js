import fs from 'node:fs';
import { exec } from 'node:child_process';

const execAsync = (command) => new Promise((resolve, reject) => {
  exec(command, (error, stdout, stderr) => {
    if (error) return reject(error);
    resolve({ stdout, stderr });
  });
});

export async function installFromZip({ zipPath, destDir, onLog = () => {} }) {
  onLog(`Extrayendo en ${destDir}...`);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const psCommand = `powershell.exe -Command "Expand-Archive -Path \"${zipPath}\" -DestinationPath \"${destDir}\" -Force"`;
  await execAsync(psCommand);
  onLog('Extracción completada.');
  return true;
}
