import fs from 'fs';
import path from 'path';

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
export function loadAppConfig(appPath, log = () => {}) {
  const possiblePaths = [
    path.join(appPath, 'app.ini'),
    path.join(appPath, 'usr', 'app.ini')
  ];

  let iniPath = possiblePaths[0];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      iniPath = p;
      break;
    }
  }

  const config = {};
  try {
    if (fs.existsSync(iniPath)) {
      const content = fs.readFileSync(iniPath, 'utf-8');
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
export function getServiceBinPath(appPath, type, version, log = () => {}) {
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

  const maxDepth = 3;

  const findInDir = (dir, depth) => {
    if (!fs.existsSync(dir)) return null;
    const direct = path.join(dir, exeName);
    if (fs.existsSync(direct)) return dir;
    const binPath = path.join(dir, 'bin', exeName);
    if (fs.existsSync(binPath)) return path.join(dir, 'bin');
    if (depth >= maxDepth) return null;
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const subPath = path.join(dir, entry);
        if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
          const found = findInDir(subPath, depth + 1);
          if (found) return found;
        }
      }
    } catch (e) {
      log(`[DEBUG] Error scanning subdirs in ${dir}: ${e.message}`);
    }
    return null;
  };

  for (const basePath of possiblePaths) {
    const found = findInDir(basePath, 0);
    if (found) return found;
  }
  log(`[DEBUG] No executable found for ${type} ${version} in paths: ${possiblePaths.join(', ')}`);
  return null;
}

function checkDirectoryHasExecutable(dir, exeName, depth = 0) {
  if (depth > 3) return false;
  if (!fs.existsSync(dir)) return false;

  const direct = path.join(dir, exeName);
  if (fs.existsSync(direct)) return true;
  const binPath = path.join(dir, 'bin', exeName);
  if (fs.existsSync(binPath)) return true;

  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const subPath = path.join(dir, entry);
      if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
        if (checkDirectoryHasExecutable(subPath, exeName, depth + 1)) return true;
      }
    }
  } catch (e) {}
  return false;
}

export function getAvailableVersions(appPath, serviceType) {
  const pathsToCheck = [serviceType];
  const exeName = exeMap[serviceType];

  if (serviceType === 'mysql') pathsToCheck.push('mariadb');
  if (serviceType === 'mariadb') pathsToCheck.push('mysql');

  const baseRoots = [appPath, path.join(appPath, 'usr'), path.join(appPath, 'neutralino')];

  let allVersions = [];
  for (const root of baseRoots) {
    for (const type of pathsToCheck) {
      const binPath = path.join(root, 'bin', type);
      if (fs.existsSync(binPath)) {
        try {
          const dirs = fs.readdirSync(binPath)
            .filter(f => {
              const fullPath = path.join(binPath, f);
              if (!fs.statSync(fullPath).isDirectory()) return false;
              
              // Si tenemos un ejecutable mapeado, verificar que exista en la carpeta
              // (ya sea directo o en una subcarpeta recursiva) para asegurar que la versión es válida
              if (exeName) {
                return checkDirectoryHasExecutable(fullPath, exeName, 0);
              }
              return true;
            });
          allVersions = [...allVersions, ...dirs];
        } catch (e) {}
      }
    }
  }
  return [...new Set(allVersions)].sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
}

export function detectServices({ appPath, userConfig, appConfig, log = () => {} }) {
  const config = appConfig || {};
  const services = [];

  const getPortFromConfig = (serviceType, fallback) => {
    const section = config[serviceType];
    if (section && section.port && !Number.isNaN(Number(section.port))) {
      return Number(section.port);
    }
    return fallback;
  };

  const isServiceInstalled = (type, version) => {
    return getServiceBinPath(appPath, type, version, log) !== null;
  };

  const availablePhp = getAvailableVersions(appPath, 'php');
  const phpVersion = config.php?.version || (availablePhp.length > 0 ? availablePhp[0] : undefined);

  const availableApache = getAvailableVersions(appPath, 'apache');
  const apacheVersion = config.apache?.version || (availableApache.length > 0 ? availableApache[0] : undefined);

  if (apacheVersion) {
    const binPath = getServiceBinPath(appPath, 'apache', apacheVersion, log);
    const apacheBase = binPath && binPath.toLowerCase().endsWith('bin') ? path.dirname(binPath) : (binPath || path.join(appPath, 'bin', 'apache', apacheVersion));
    const phpBinPath = getServiceBinPath(appPath, 'php', phpVersion, log);
    const phpBase = phpBinPath && phpBinPath.toLowerCase().endsWith('bin') ? path.dirname(phpBinPath) : (phpBinPath || (phpVersion ? path.join(appPath, 'bin', 'php', phpVersion) : null));
    const documentRoot = config.apache?.documentroot || userConfig?.projectsPath || path.join(appPath, 'www');
    const apacheConfigs = [
      { label: 'OPEN_DOCROOT', path: documentRoot, type: 'folder' },
      { label: 'httpd.conf', path: path.join(apacheBase, 'conf', 'httpd.conf') },
      { label: 'httpd-vhosts.conf', path: path.join(apacheBase, 'conf', 'extra', 'httpd-vhosts.conf') },
      { label: 'php.ini', path: phpBase ? path.join(phpBase, 'php.ini') : '' },
      { label: 'php_errors.log', path: path.join(appPath, 'tmp', 'php_errors.log') }
    ].filter(c => c.path && (c.type === 'folder' || fs.existsSync(c.path)));

    services.push({
      name: 'Apache',
      type: 'apache',
      version: apacheVersion,
      phpVersion: phpVersion,
      configs: apacheConfigs,
      availableVersions: availableApache,
      availablePhpVersions: availablePhp,
      isInstalled: binPath !== null,
      requiresPhp: true,
      dependenciesReady: binPath !== null && !!phpBinPath,
      port: getPortFromConfig('apache', 80)
    });
  }

  if (phpVersion) {
    const binPath = getServiceBinPath(appPath, 'php', phpVersion, log);
    services.push({
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

  const availableMysql = getAvailableVersions(appPath, 'mysql');
  const mysqlVersion = config.mysql?.version || (availableMysql.length > 0 ? availableMysql[0] : undefined);

  if (mysqlVersion) {
    const binPath = getServiceBinPath(appPath, 'mysql', mysqlVersion, log);
    let mysqlBase = binPath && binPath.toLowerCase().endsWith('bin') ? path.dirname(binPath) : (binPath || path.join(appPath, 'bin', 'mysql', mysqlVersion));
    const mysqlConfigs = [
      { label: 'my.ini', path: path.join(mysqlBase, 'my.ini') },
      { label: 'error.log', path: path.join(appPath, 'data', 'mysql', 'error.log') }
    ];
    if (fs.existsSync(mysqlBase)) {
      try {
        const files = fs.readdirSync(mysqlBase);
        files.forEach(file => {
          if (file.endsWith('.log')) mysqlConfigs.push({ label: file, path: path.join(mysqlBase, file) });
        });
        const dataInBin = path.join(mysqlBase, 'data');
        if (fs.existsSync(dataInBin)) {
          const dataFiles = fs.readdirSync(dataInBin);
          dataFiles.forEach(file => {
            if (file.endsWith('.log')) mysqlConfigs.push({ label: `data/${file}`, path: path.join(dataInBin, file) });
          });
        }
        const AppDataPath = path.join(appPath, 'data');
        if (fs.existsSync(AppDataPath)) {
          try {
            const dataSubfolders = fs.readdirSync(AppDataPath);
            dataSubfolders.forEach(subfolder => {
              const subfolderPath = path.join(AppDataPath, subfolder);
              if (fs.statSync(subfolderPath).isDirectory()) {
                const subFiles = fs.readdirSync(subfolderPath);
                subFiles.forEach(file => {
                  if (file.endsWith('.log')) mysqlConfigs.push({ label: `${subfolder}/${file}`, path: path.join(subfolderPath, file) });
                });
              }
            });
          } catch (e) {}
        }
      } catch (e) {
        log(`[DEBUG] Error escaneando logs de MySQL: ${e.message}`);
      }
    }

    services.push({
      name: 'MySQL',
      type: 'mysql',
      version: mysqlVersion,
      configs: mysqlConfigs,
      availableVersions: availableMysql,
      isInstalled: binPath !== null,
      port: getPortFromConfig('mysql', 3306)
    });
  }

  const availableNginx = getAvailableVersions(appPath, 'nginx');
  const nginxVersion = config.nginx?.version || (availableNginx.length > 0 ? availableNginx[0] : undefined);

  if (nginxVersion) {
    const binPath = getServiceBinPath(appPath, 'nginx', nginxVersion, log);
    const nginxBase = binPath && binPath.toLowerCase().endsWith('bin') ? path.dirname(binPath) : (binPath || path.join(appPath, 'bin', 'nginx', nginxVersion));
    const documentRoot = config.apache?.documentroot || userConfig?.projectsPath || path.join(appPath, 'www');
    const nginxConfigs = [
      { label: 'OPEN_DOCROOT', path: documentRoot, type: 'folder' },
      { label: 'nginx.conf', path: path.join(nginxBase, 'conf', 'nginx.conf') }
    ].filter(c => c.path && (c.type === 'folder' || fs.existsSync(c.path)));

    services.push({
      name: 'Nginx',
      type: 'nginx',
      version: nginxVersion,
      configs: nginxConfigs,
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
    const available = getAvailableVersions(appPath, db.type);
    const version = config[db.type]?.version || (available.length > 0 ? available[0] : undefined);
    if (!version) continue;
    const binPath = getServiceBinPath(appPath, db.type, version, log);
    services.push({
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

  return services;
}

export function clearLogsFile(targetPath) {
  try {
    fs.writeFileSync(targetPath, '');
    return true;
  } catch (error) {
    // Propagar mensaje para diagnóstico en tests o logs
    throw error;
  }
}
