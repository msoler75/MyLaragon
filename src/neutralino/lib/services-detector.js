// Path utilities compatible con navegador y Node.js
const pathJoin = (...parts) => {
  return parts
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/\\/g, '/');
};

const pathDirname = (filePath) => {
  const normalized = filePath.replace(/\\/g, '/');
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash > 0 ? normalized.substring(0, lastSlash) : normalized;
};

// Alias para compatibilidad
const path = {
  join: pathJoin,
  dirname: pathDirname,
  relative: (from, to) => {
    const fromParts = from.split('/').filter(p => p);
    const toParts = to.split('/').filter(p => p);
    let i = 0;
    while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
      i++;
    }
    const up = fromParts.slice(i).map(() => '..').join('/');
    const down = toParts.slice(i).join('/');
    return up ? (up + '/' + down) : down;
  }
};

const exeMap = {
  apache: 'httpd.exe',
  nginx: 'nginx.exe',
  mysql: 'mysqld.exe',
  mariadb: 'mysqld.exe',
  redis: 'redis-server.exe',
  memcached: 'memcached.exe',
  mailpit: 'mailpit.exe',
  mongodb: 'mongod.exe',
  postgresql: 'postgres.exe',
  postgres: 'postgres.exe',
  php: 'php.exe'
};

// Leer configuración de App.ini en una ruta dada
export async function loadAppConfig(fsAdapter, appPath, log = () => {}) {
  const possiblePaths = [
    path.join(appPath, 'app.ini'),
    path.join(appPath, 'usr', 'app.ini')
  ];

  let iniPath = possiblePaths[0];
  for (const p of possiblePaths) {
    if (await fsAdapter.fileExists(p)) {
      iniPath = p;
      break;
    }
  }

  const config = {};
  try {
    if (await fsAdapter.fileExists(iniPath)) {
      const content = await fsAdapter.readFile(iniPath);
      const lines = content.split('\n');
      let section = '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          section = trimmed.slice(1, -1).toLowerCase();
        } else if (trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=');
          if (!config[section]) config[section] = {};
          config[section][key.trim().toLowerCase()] = value.trim();
        }
      }
    } else {
      log(`App config not found at: ${iniPath}`, 'WARNING');
    }
  } catch (error) {
    log(`Error reading app.ini: ${error.message}`, 'ERROR');
  }
  return config;
}

// Buscar ruta binaria de un servicio en un appPath concreto
export async function getServiceBinPath(fsAdapter, appPath, type, version, log = console.log) {
  if (!type || !version) return null;

  // Permitir instalaciones en appPath, usr/ y neutralino/ (portable)
  const baseRoots = [appPath, path.join(appPath, 'usr'), path.join(appPath, 'neutralino')];

  const exeName = exeMap[type];
  if (!exeName) return null;

  const typeOrAlias = type === 'mysql' ? 'mariadb' : (type === 'mariadb' ? 'mysql' : type);
  const possiblePaths = baseRoots.flatMap(root => ([
    // Prefer exact versión
    path.join(root, 'bin', type, version),
    path.join(root, 'bin', typeOrAlias, version),
    // Fallback: escanear toda la carpeta del tipo aunque el nombre de versión no coincida (ej: "php-8.2.12")
    path.join(root, 'bin', type),
    path.join(root, 'bin', typeOrAlias)
  ]));

  const maxDepth = 5;

  const findInDir = async (dir, depth) => {
    if (!(await fsAdapter.fileExists(dir))) return null;
    const direct = path.join(dir, exeName);
    if (await fsAdapter.fileExists(direct)) return dir;
    const binPath = path.join(dir, 'bin', exeName);
    if (await fsAdapter.fileExists(binPath)) return path.join(dir, 'bin');
    if (depth >= maxDepth) return null;
    try {
      const result = await fsAdapter.readDir(dir);
      const entries = result.entries || result; // Adaptador devuelve { entries: [...] }
      for (const entry of entries) {
        const entryName = typeof entry === 'string' ? entry : entry.entry;
        const subPath = path.join(dir, entryName);
        if (await fsAdapter.fileExists(subPath)) {
          // Verificar si es directorio intentando leerlo
          try {
            await fsAdapter.readDir(subPath);
            const found = await findInDir(subPath, depth + 1);
            if (found) return found;
          } catch (e) {
            // No es directorio, continuar
          }
        }
      }
    } catch (e) {
      log(`[DEBUG] Error scanning subdirs in ${dir}: ${e.message}`);
    }
    return null;
  };

  for (const basePath of possiblePaths) {
    const found = await findInDir(basePath, 0);
    if (found) return found;
  }
  log(`[DEBUG] No executable found for ${type} ${version} in paths: ${possiblePaths.join(', ')}`);
  return null;
}

async function checkDirectoryHasExecutable(fsAdapter, dir, exeName, depth = 0) {
  if (depth > 4) return false;
  if (!(await fsAdapter.fileExists(dir))) return false;

  const direct = path.join(dir, exeName);
  if (await fsAdapter.fileExists(direct)) return true;
  const binPath = path.join(dir, 'bin', exeName);
  if (await fsAdapter.fileExists(binPath)) return true;

  try {
    const result = await fsAdapter.readDir(dir);
    const entries = result.entries || result; // Adaptador devuelve { entries: [...] }
    for (const entry of entries) {
      const entryName = typeof entry === 'string' ? entry : entry.entry;
      const subPath = path.join(dir, entryName);
      if (await fsAdapter.fileExists(subPath)) {
        try {
          await fsAdapter.readDir(subPath);
          if (await checkDirectoryHasExecutable(fsAdapter, subPath, exeName, depth + 1)) return true;
        } catch (e) {
          // No es directorio
        }
      }
    }
  } catch (e) {}
  return false;
}

async function scanForConfigs(fsAdapter, serviceId, basePath, subPath, patterns, options = {}) {
  const fullBasePath = path.join(basePath, subPath);
  const configs = [];

  if (!(await fsAdapter.fileExists(fullBasePath))) return configs;

  try {
    const result = await fsAdapter.readDir(fullBasePath);
    const files = result.entries || result;
    for (const file of files) {
      const fileName = typeof file === 'string' ? file : file.entry;
      const matches = patterns.some(pattern => {
        if (pattern.startsWith('*.')) {
          return fileName.endsWith(pattern.slice(2));
        }
        return fileName.includes(pattern);
      });
      if (matches) {
        const fullPath = path.join(fullBasePath, fileName);
        const relativePath = path.relative(fullBasePath, fullPath);
        configs.push({
          label: `${serviceId}/${relativePath}`,
          path: fullPath,
          type: options.type
        });
      }
    }
  } catch (e) {
    // Error reading directory
  }

  return configs;
}

export async function getAvailableVersions(fsAdapter, appPath, serviceType) {
  const pathsToCheck = [serviceType];
  const exeName = exeMap[serviceType];

  if (serviceType === 'mysql') pathsToCheck.push('mariadb');
  if (serviceType === 'mariadb') pathsToCheck.push('mysql');

  const baseRoots = [appPath, path.join(appPath, 'usr'), path.join(appPath, 'neutralino')];

  let allVersions = [];
  for (const root of baseRoots) {
    for (const type of pathsToCheck) {
      const binPath = path.join(root, 'bin', type);
      if (await fsAdapter.fileExists(binPath)) {
        try {
          const result = await fsAdapter.readDir(binPath);
          const entries = result.entries || result; // Adaptador devuelve { entries: [...] }
          const dirs = [];
          for (const entry of entries) {
            const entryName = typeof entry === 'string' ? entry : entry.entry;
            const fullPath = path.join(binPath, entryName);
            // Verificar si es directorio
            try {
              await fsAdapter.readDir(fullPath);
              // Es directorio, verificar ejecutable
              if (exeName) {
                if (await checkDirectoryHasExecutable(fsAdapter, fullPath, exeName, 0)) {
                  dirs.push(entryName);
                }
              } else {
                dirs.push(entryName);
              }
            } catch (e) {
              // No es directorio, ignorar
            }
          }
          allVersions = [...allVersions, ...dirs];
        } catch (e) {}
      }
    }
  }
  return [...new Set(allVersions)].sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
}

export async function detectServices({ fsAdapter, appPath, userConfig, appConfig, log = () => {} }) {
  const config = appConfig || {};
  const services = [];

  log('[DETECTOR] ===== DETECT SERVICES INICIO =====');
  log(`[DETECTOR] appPath: ${appPath}`);
  log(`[DETECTOR] config sections: ${Object.keys(config).join(', ')}`);

  const getPortFromConfig = (serviceType, fallback) => {
    const section = config[serviceType];
    if (section && section.port && !Number.isNaN(Number(section.port))) {
      return Number(section.port);
    }
    return fallback;
  };

  const isServiceInstalled = async (type, version) => {
    return (await getServiceBinPath(fsAdapter, appPath, type, version, log)) !== null;
  };

  const availablePhp = await getAvailableVersions(fsAdapter, appPath, 'php');
  const phpVersion = config.php?.version || (availablePhp.length > 0 ? availablePhp[0] : undefined);
  log(`[DETECTOR] PHP: availableVersions=${JSON.stringify(availablePhp)}, selected=${phpVersion}`);

  const availableApache = await getAvailableVersions(fsAdapter, appPath, 'apache');
  const apacheVersion = config.apache?.version || (availableApache.length > 0 ? availableApache[0] : undefined);
  log(`[DETECTOR] Apache: availableVersions=${JSON.stringify(availableApache)}, selected=${apacheVersion}`);

  if (apacheVersion) {
    const binPath = await getServiceBinPath(fsAdapter, appPath, 'apache', apacheVersion, log);
    const apacheBase = binPath && binPath.toLowerCase().endsWith('bin') ? path.dirname(binPath) : (binPath || path.join(appPath, 'bin', 'apache', apacheVersion));
    const phpBinPath = await getServiceBinPath(fsAdapter, appPath, 'php', phpVersion, log);
    const phpBase = phpBinPath && phpBinPath.toLowerCase().endsWith('bin') ? path.dirname(phpBinPath) : (phpBinPath || (phpVersion ? path.join(appPath, 'bin', 'php', phpVersion) : null));
    const documentRoot = config.apache?.documentroot || userConfig?.projectsPath || path.join(appPath, 'www');
    const apacheConfigs = [
      { label: 'OPEN_DOCROOT', path: documentRoot, type: 'folder' },
      { label: 'httpd.conf', path: path.join(apacheBase, 'conf', 'httpd.conf') },
      { label: 'httpd-vhosts.conf', path: path.join(apacheBase, 'conf', 'extra', 'httpd-vhosts.conf') },
      { label: 'php.ini', path: phpBase ? path.join(phpBase, 'php.ini') : '' },
      { label: 'php_errors.log', path: path.join(appPath, 'tmp', 'php_errors.log') }
    ];
    
    // Filtrar configs que existan
    const filteredConfigs = [];
    for (const c of apacheConfigs) {
      if (c.path && (c.type === 'folder' || (await fsAdapter.fileExists(c.path)))) {
        filteredConfigs.push(c);
      }
    }

    // Filtrar solo versiones de PHP con módulo Apache (php*apache2_4.dll)
    const phpVersionsWithApacheModule = [];
    for (const v of availablePhp) {
      const bin = await getServiceBinPath(fsAdapter, appPath, 'php', v, log);
      if (!bin) continue;
      
      // Intentar en el directorio del binario y en su padre
      const dirsToCheck = [];
      if (bin.toLowerCase().endsWith('bin')) {
        dirsToCheck.push(bin); // Directorio bin
        dirsToCheck.push(path.dirname(bin)); // Directorio padre
      } else if (bin.toLowerCase().endsWith('.exe')) {
        // Es la ruta completa al ejecutable
        const binDir = path.dirname(bin);
        dirsToCheck.push(binDir);
        if (binDir.toLowerCase().endsWith('bin')) {
          dirsToCheck.push(path.dirname(binDir));
        }
      } else {
        // Es un directorio
        dirsToCheck.push(bin);
      }
      
      // Buscar módulo en cualquiera de los directorios
      let found = false;
      for (const dir of dirsToCheck) {
        try {
          const entries = await fsAdapter.readDir(dir);
          for (const entry of entries) {
            const fileName = typeof entry === 'string' ? entry : entry.entry;
            if (/^php\d+apache2_4\.dll$/i.test(fileName)) {
              found = true;
              break;
            }
          }
          if (found) break;
        } catch (e) {
          // Continuar con el siguiente directorio
        }
      }
      if (found) {
        phpVersionsWithApacheModule.push(v);
      }
    }

    services.push({
      id: 'apache',
      name: 'Apache',
      type: 'apache',
      version: apacheVersion,
      phpVersion: phpVersion,
      configs: filteredConfigs,
      availableVersions: availableApache,
      availablePhpVersions: availablePhp,
      isInstalled: binPath !== null,
      requiresPhp: true,
      dependenciesReady: binPath !== null && !!phpBinPath,
      port: getPortFromConfig('apache', 80)
    });
  }

  if (phpVersion) {
    const binPath = await getServiceBinPath(fsAdapter, appPath, 'php', phpVersion, log);
    services.push({
      id: 'php',
      name: 'PHP',
      type: 'php',
      version: phpVersion,
      availableVersions: availablePhp,
      isInstalled: binPath !== null,
      requiresPhp: false,
      dependenciesReady: binPath !== null,
      port: null
    });
  }

  const availableMysql = await getAvailableVersions(fsAdapter, appPath, 'mysql');
  const mysqlVersion = config.mysql?.version || (availableMysql.length > 0 ? availableMysql[0] : undefined);

  if (mysqlVersion) {
    const binPath = await getServiceBinPath(fsAdapter, appPath, 'mysql', mysqlVersion, log);
    let mysqlBase = binPath && binPath.toLowerCase().endsWith('bin') ? path.dirname(binPath) : (binPath || path.join(appPath, 'bin', 'mysql', mysqlVersion));
    const mysqlConfigs = [
      { label: 'my.ini', path: path.join(mysqlBase, 'my.ini') }
    ];
    if (await fsAdapter.fileExists(mysqlBase)) {
      try {
        const result = await fsAdapter.readDir(mysqlBase);
        const entries = result.entries || result;
        for (const entry of entries) {
          const fileName = typeof entry === 'string' ? entry : entry.entry;
          if (fileName.endsWith('.log') || fileName.endsWith('.err')) {
            mysqlConfigs.push({ label: fileName, path: path.join(mysqlBase, fileName), type: 'log' });
          }
        }
        const dataInBin = path.join(mysqlBase, 'data');
        if (await fsAdapter.fileExists(dataInBin)) {
          const dataResult = await fsAdapter.readDir(dataInBin);
          const dataEntries = dataResult.entries || dataResult;
          for (const entry of dataEntries) {
            const fileName = typeof entry === 'string' ? entry : entry.entry;
            if (fileName.endsWith('.log')) {
              mysqlConfigs.push({ label: `data/${fileName}`, path: path.join(dataInBin, fileName) });
            }
          }
        }
        const AppDataPath = path.join(appPath, 'data');
        if (await fsAdapter.fileExists(AppDataPath)) {
          const dataConfigs = await scanForConfigs(fsAdapter, 'mysql', AppDataPath, 'mysql', ['*.log'], { type: 'log' });
          mysqlConfigs.push(...dataConfigs);
        }
      } catch (e) {
        log(`[DEBUG] Error escaneando logs de MySQL: ${e.message}`);
      }
    }

    services.push({
      id: 'mysql',
      name: 'MySQL',
      type: 'mysql',
      version: mysqlVersion,
      configs: mysqlConfigs,
      availableVersions: availableMysql,
      isInstalled: binPath !== null,
      port: getPortFromConfig('mysql', 3306)
    });
  }

  const availableNginx = await getAvailableVersions(fsAdapter, appPath, 'nginx');
  const nginxVersion = config.nginx?.version || (availableNginx.length > 0 ? availableNginx[0] : undefined);

  if (nginxVersion) {
    const binPath = await getServiceBinPath(fsAdapter, appPath, 'nginx', nginxVersion, log);
    const nginxBase = binPath && binPath.toLowerCase().endsWith('bin') ? path.dirname(binPath) : (binPath || path.join(appPath, 'bin', 'nginx', nginxVersion));
    const documentRoot = config.apache?.documentroot || userConfig?.projectsPath || path.join(appPath, 'www');
    const nginxConfigs = [
      { label: 'OPEN_DOCROOT', path: documentRoot, type: 'folder' },
      { label: 'nginx.conf', path: path.join(nginxBase, 'conf', 'nginx.conf') }
    ];
    
    // Filtrar configs que existan
    const filteredNginxConfigs = [];
    for (const c of nginxConfigs) {
      if (c.path && (c.type === 'folder' || (await fsAdapter.fileExists(c.path)))) {
        filteredNginxConfigs.push(c);
      }
    }

    services.push({
      id: 'nginx',
      name: 'Nginx',
      type: 'nginx',
      version: nginxVersion,
      configs: filteredNginxConfigs,
      availableVersions: availableNginx,
      isInstalled: binPath !== null,
      requiresPhp: false,
      dependenciesReady: binPath !== null,
      port: getPortFromConfig('nginx', 80)
    });
  }

  const dbServices = [
    { name: 'Redis', type: 'redis', exe: 'redis-server.exe', port: 6379 },
    { name: 'Memcached', type: 'memcached', exe: 'memcached.exe', port: 11211 },
    { name: 'Mailpit', type: 'mailpit', exe: 'mailpit.exe', port: 8025 },
    { name: 'MongoDB', type: 'mongodb', exe: 'mongod.exe', port: 27017 },
    { name: 'PostgreSQL', type: 'postgresql', exe: 'postgres.exe', port: 5432 }
  ];

  for (const db of dbServices) {
    const available = await getAvailableVersions(fsAdapter, appPath, db.type);
    const version = config[db.type]?.version || (available.length > 0 ? available[0] : undefined);
    if (!version) continue;
    const binPath = await getServiceBinPath(fsAdapter, appPath, db.type, version, log);
    services.push({
      id: db.type,
      name: db.name,
      type: db.type,
      version,
      availableVersions: available,
      isInstalled: binPath !== null,
      requiresPhp: false,
      dependenciesReady: binPath !== null,
      port: getPortFromConfig(db.type, db.port)
    });
  }

  log(`[DETECTOR] ===== DETECT SERVICES FIN: ${services.length} servicios =====`);
  return services;
}

export async function clearLogsFile(fsAdapter, targetPath) {
  try {
    await fsAdapter.writeFile(targetPath, '');
    return true;
  } catch (error) {
    // Propagar mensaje para diagnóstico en tests o logs
    throw error;
  }
}
