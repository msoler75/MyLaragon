# 🚀 ROADMAP - WebServDev
## Mejoras Prioritarias: Dashboard, SSL Local y Virtual Hosts Y sugerencias de código

**Fecha**: 22 de enero de 2026  
**Versión Objetivo**: v1.1.0

---

## 📊 **5. Dashboard de Métricas de Desarrollo**

### **Objetivo**
Crear un panel de métricas en tiempo real que muestre el estado del entorno de desarrollo, optimizaciones de rendimiento y estadísticas útiles para desarrolladores.

### **Implementación Técnica**

#### **A. Métricas del Sistema**
```javascript
// src/utils/systemMetrics.js
export class SystemMetrics {
  async collectMetrics() {
    return {
      // PHP Configuration
      php: {
        version: await this.getPhpVersion(),
        memoryLimit: await this.getPhpConfig('memory_limit'),
        maxExecutionTime: await this.getPhpConfig('max_execution_time'),
        uploadMaxFilesize: await this.getPhpConfig('upload_max_filesize'),
        postMaxSize: await this.getPhpConfig('post_max_size')
      },
      
      // Apache Configuration
      apache: {
        version: await this.getApacheVersion(),
        activeConnections: await this.getActiveConnections(),
        workerProcesses: await this.getWorkerConfig()
      },
      
      // MySQL Configuration
      mysql: {
        version: await this.getMysqlVersion(),
        connections: await this.getMysqlConnections(),
        maxConnections: await this.getMysqlMaxConnections(),
        memoryUsage: await this.getMysqlMemoryUsage()
      },
      
      // System Resources
      system: {
        diskUsage: await this.getDiskUsage(),
        memoryUsage: await this.getSystemMemory(),
        cpuUsage: await this.getCpuUsage(),
        activeProcesses: await this.getActiveProcesses()
      },
      
      // Development Stats
      development: {
        activeProjects: await this.getActiveProjects(),
        lastActivity: await this.getLastActivity(),
        totalProjects: await this.getTotalProjects(),
        avgLoadTime: await this.getAvgLoadTime()
      }
    };
  }
}
```

#### **B. Panel de UI React**
```jsx
// src/Views/DashboardView.jsx
import { useState, useEffect } from 'react';
import { Activity, HardDrive, Zap, Clock } from 'lucide-react';

const DashboardView = () => {
  const [metrics, setMetrics] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5s

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await window.electronAPI.getSystemMetrics();
      setMetrics(data);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="dashboard-container p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* PHP Metrics Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-500">PHP</span>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold">
              {metrics?.php?.version || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Memory: {metrics?.php?.memoryLimit}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Upload: {metrics?.php?.uploadMaxFilesize}
            </div>
          </div>
        </div>

        {/* MySQL Metrics Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-500">MySQL</span>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold">
              {metrics?.mysql?.connections || 0}/
              {metrics?.mysql?.maxConnections || '∞'}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ 
                  width: `${(metrics?.mysql?.connections / metrics?.mysql?.maxConnections) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* System Resources Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <HardDrive className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-gray-500">Sistema</span>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold">
              {metrics?.system?.diskUsage?.used || 'N/A'}/
              {metrics?.system?.diskUsage?.total || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              CPU: {metrics?.system?.cpuUsage || 'N/A'}%
            </div>
          </div>
        </div>

        {/* Development Activity Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-gray-500">Actividad</span>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold">
              {metrics?.development?.activeProjects || 0} proyectos
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {metrics?.development?.lastActivity || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Charts Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Uso de Memoria (Últimas 24h)</h3>
          <div className="h-40 flex items-end space-x-1">
            {/* Mini chart implementation */}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Conexiones Activas</h3>
          <div className="h-40 flex items-end space-x-1">
            {/* Real-time connection graph */}
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Configuración del Dashboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Frecuencia de Actualización
            </label>
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value={1000}>1 segundo</option>
              <option value={5000}>5 segundos</option>
              <option value={30000}>30 segundos</option>
              <option value={60000}>1 minuto</option>
            </select>
          </div>
          
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Alertas automáticas</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Gráficos en tiempo real</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
```

#### **C. Backend Integration**
```javascript
// metrics-collector.js
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

export class MetricsCollector {
  async getSystemMetrics() {
    const [phpMetrics, apacheMetrics, mysqlMetrics, systemMetrics] = await Promise.all([
      this.collectPhpMetrics(),
      this.collectApacheMetrics(),
      this.collectMysqlMetrics(),
      this.collectSystemMetrics()
    ]);

    return {
      php: phpMetrics,
      apache: apacheMetrics,
      mysql: mysqlMetrics,
      system: systemMetrics,
      timestamp: new Date().toISOString()
    };
  }

  async collectPhpMetrics() {
    try {
      const { stdout } = await execAsync('php -v');
      const version = stdout.split('\n')[0];
      
      // Get PHP configuration
      const configCommands = [
        'php -r "echo ini_get(\'memory_limit\');"',
        'php -r "echo ini_get(\'max_execution_time\');"',
        'php -r "echo ini_get(\'upload_max_filesize\');"',
        'php -r "echo ini_get(\'post_max_size\');"'
      ];

      const [memoryLimit, maxExecutionTime, uploadMaxFilesize, postMaxSize] = 
        await Promise.all(configCommands.map(cmd => execAsync(cmd)));

      return {
        version: version.trim(),
        memoryLimit: memoryLimit.stdout.trim(),
        maxExecutionTime: maxExecutionTime.stdout.trim(),
        uploadMaxFilesize: uploadMaxFilesize.stdout.trim(),
        postMaxSize: postMaxSize.stdout.trim()
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async collectApacheMetrics() {
    try {
      // Check if Apache is running
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq httpd.exe" /FO CSV');
      const processes = stdout.split('\n').length - 1; // -1 for header
      
      return {
        isRunning: processes > 0,
        processes: processes,
        memoryUsage: await this.getApacheMemoryUsage()
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async collectMysqlMetrics() {
    try {
      // This would require MySQL credentials or socket access
      const { stdout } = await execAsync('mysqladmin status 2>/dev/null');
      
      // Parse MySQL status output
      const lines = stdout.split('\n');
      const connections = lines.find(line => line.includes('Threads'))?.split(':')[1]?.trim();
      
      return {
        isRunning: !stdout.includes('error'),
        connections: connections || '0',
        status: stdout.trim()
      };
    } catch (error) {
      return { error: 'MySQL not accessible' };
    }
  }

  async collectSystemMetrics() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    return {
      memory: {
        total: this.formatBytes(totalMem),
        used: this.formatBytes(usedMem),
        free: this.formatBytes(freeMem),
        usage: Math.round((usedMem / totalMem) * 100)
      },
      cpu: {
        usage: await this.getCpuUsage(),
        cores: os.cpus().length
      },
      disk: await this.getDiskUsage()
    };
  }

  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}
```

### **Beneficios Esperados**
- ✅ **Visibilidad completa** del entorno de desarrollo
- ✅ **Detección temprana** de problemas (alta memoria, conexiones saturadas)
- ✅ **Optimización** automática basada en métricas
- ✅ **Performance baseline** para comparar mejoras

---

## 🔒 **9. SSL/HTTPS Local Automático**

### **Objetivo**
Generar y configurar certificados SSL autofirmados automáticamente para desarrollo local con HTTPS, incluyendo gestión de hosts y renovación automática.

### **Implementación Técnica**

#### **A. Certificate Manager**
```javascript
// src/utils/sslManager.js
export class SSLManager {
  constructor() {
    this.certPath = './certs/';
    this.caFile = `${this.certPath}ca.pem`;
    this.caKey = `${this.certPath}ca-key.pem`;
  }

  async initialize() {
    // Ensure certs directory exists
    await this.ensureDirectory();
    
    // Check if CA exists, if not create it
    if (!await this.fileExists(this.caFile)) {
      console.log('Creating Certificate Authority...');
      await this.createCertificateAuthority();
    }
  }

  async createCertificateAuthority() {
    const caConfig = `
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = req_distinguished_name
x509_extensions = v3_ca

[req_distinguished_name]
C = ES
ST = Madrid
L = Madrid
O = WebServDev
OU = Development
CN = WebServDev Root CA

[v3_ca]
basicConstraints = critical,CA:TRUE
keyUsage = critical, keyCertSign, cRLSign
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.local
DNS.3 = *.test
IP.1 = 127.0.0.1
IP.2 = ::1
`;

    // Write CA configuration
    await this.writeFile(`${this.certPath}ca.conf`, caConfig);
    
    // Generate CA private key and certificate
    await this.exec(`openssl genrsa -out ${this.caKey} 2048`);
    await this.exec(`openssl req -new -x509 -days 3650 -key ${this.caKey} -out ${this.caFile} -config ${this.certPath}ca.conf`);
    
    console.log('Certificate Authority created successfully');
  }

  async generateCertificate(domain) {
    const certFile = `${this.certPath}${domain}.pem`;
    const keyFile = `${this.certPath}${domain}-key.pem`;
    const csrFile = `${this.certPath}${domain}.csr`;
    
    // Check if certificate already exists and is valid
    if (await this.certificateExists(domain)) {
      console.log(`Certificate for ${domain} already exists`);
      return { certFile, keyFile };
    }

    // Create certificate configuration
    const certConfig = `
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = req_distinguished_name

[req_distinguished_name]
C = ES
ST = Madrid
L = Madrid
O = WebServDev
OU = Development
CN = ${domain}

[req_ext]
subjectAltName = @alt_names
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[alt_names]
DNS.1 = ${domain}
DNS.2 = *.${domain}
DNS.3 = localhost
IP.1 = 127.0.0.1
`;

    // Generate private key and certificate signing request
    await this.writeFile(`${this.certPath}${domain}.conf`, certConfig);
    await this.exec(`openssl genrsa -out ${keyFile} 2048`);
    await this.exec(`openssl req -new -key ${keyFile} -out ${csrFile} -config ${this.certPath}${domain}.conf`);
    
    // Sign certificate with CA
    await this.exec(`openssl x509 -req -in ${csrFile} -CA ${this.caFile} -CAkey ${this.caKey} -CAcreateserial -out ${certFile} -days 365 -extensions req_ext -extfile ${this.certPath}${domain}.conf`);
    
    // Clean up CSR file
    await this.deleteFile(csrFile);
    
    console.log(`Certificate generated for ${domain}`);
    return { certFile, keyFile };
  }

  async configureApacheSSL(domain, documentRoot, port = 443) {
    const vhostsPath = './apache/conf/extra/httpd-vhosts-ssl.conf';
    
    const sslConfig = `
# SSL Virtual Host for ${domain}
<VirtualHost *:${port}>
    ServerName ${domain}
    DocumentRoot "${documentRoot}"
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile "${this.certPath}${domain}.pem"
    SSLCertificateKeyFile "${this.certPath}${domain}-key.pem"
    
    # SSL Security Settings
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    
    # Document Root
    <Directory "${documentRoot}">
        AllowOverride All
        Require all granted
    </Directory>
    
    # Logging
    ErrorLog "logs/${domain}-ssl-error.log"
    CustomLog "logs/${domain}-ssl-access.log" combined
</VirtualHost>
`;
    
    await this.appendToFile(vhostsPath, sslConfig);
    
    // Update main Apache configuration if needed
    await this.updateApacheMainConfig();
  }

  async updateApacheMainConfig() {
    const httpdConfPath = './apache/conf/httpd.conf';
    
    // Check if SSL module is enabled
    const httpdConf = await this.readFile(httpdConfPath);
    
    if (!httpdConf.includes('LoadModule ssl_module')) {
      await this.appendToFile(httpdConfPath, `
# SSL Module
LoadModule ssl_module modules/mod_ssl.so

# SSL Configuration
Include conf/extra/httpd-vhosts-ssl.conf
`);
    }
  }

  async addToHostsFile(domain) {
    const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
    
    try {
      const hostsContent = await this.readFile(hostsPath);
      if (!hostsContent.includes(domain)) {
        await this.appendToFile(hostsPath, `
127.0.0.1 ${domain}
`);
        console.log(`Added ${domain} to hosts file`);
      }
    } catch (error) {
      console.warn(`Could not modify hosts file: ${error.message}`);
      console.log(`Please add manually: 127.0.0.1 ${domain}`);
    }
  }

  async certificateExists(domain) {
    const certFile = `${this.certPath}${domain}.pem`;
    if (!await this.fileExists(certFile)) return false;
    
    // Check if certificate is still valid (not expired)
    try {
      const { stdout } = await this.exec(`openssl x509 -in ${certFile} -noout -enddate`);
      const endDate = new Date(stdout.replace('notAfter=', ''));
      return endDate > new Date();
    } catch {
      return false;
    }
  }

  async installCertificateToSystem() {
    // Install CA certificate to Windows Trusted Root
    try {
      await this.exec(`certutil -addstore -f "ROOT" "${this.caFile}"`);
      console.log('Certificate Authority installed to Windows Trusted Root');
    } catch (error) {
      console.warn('Could not install CA certificate automatically');
      console.log(`Please install manually: ${this.caFile}`);
    }
  }

  async createDevelopmentScript() {
    const scriptContent = `
@echo off
echo Installing SSL Certificate Authority...
certutil -addstore -f "ROOT" "${this.caFile}"

echo.
echo SSL Setup Complete!
echo.
echo Your browser will now trust certificates for:
echo - localhost
echo - *.local
echo - *.test
echo.
echo Please restart your browser after installation.
echo.
pause
`;

    await this.writeFile(`${this.certPath}install-ca.bat`, scriptContent);
  }
}
```

#### **B. React UI for SSL Management**
```jsx
// src/Views/SSLManagerView.jsx
import { useState, useEffect } from 'react';
import { Lock, Key, Globe, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const SSLManagerView = () => {
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [installStatus, setInstallStatus] = useState('pending');

  const handleGenerateCertificate = async () => {
    if (!newDomain.trim()) return;
    
    setIsGenerating(true);
    try {
      await window.electronAPI.generateSSLCertificate({
        domain: newDomain,
        documentRoot: `/www/${newDomain}/public`
      });
      
      setDomains(prev => [...prev, {
        domain: newDomain,
        status: 'active',
        port: 443,
        createdAt: new Date().toISOString()
      }]);
      
      setNewDomain('');
      
      // Show success notification
      window.electronAPI.showNotification({
        title: 'SSL Certificate Generated',
        message: `Certificate created for ${newDomain}`,
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInstallCA = async () => {
    setInstallStatus('installing');
    try {
      await window.electronAPI.installCACertificate();
      setInstallStatus('installed');
    } catch (error) {
      setInstallStatus('error');
    }
  };

  return (
    <div className="ssl-manager-container p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Lock className="mr-3 h-8 w-8 text-blue-500" />
            SSL/HTTPS Local Automático
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gestiona certificados SSL para desarrollo local con HTTPS
          </p>
        </div>

        {/* CA Installation Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Key className="mr-2 h-5 w-5" />
              Certificate Authority (CA)
            </h2>
            
            {installStatus === 'installed' && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="mr-1 h-4 w-4" />
                <span className="text-sm">Instalado</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            La CA local permite que tu navegador confíe en todos los certificados generados por WebServDev.
          </p>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleInstallCA}
              disabled={installStatus === 'installed'}
              className={`px-4 py-2 rounded-lg flex items-center ${
                installStatus === 'installed' 
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {installStatus === 'installing' ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              {installStatus === 'installed' ? 'CA Instalado' : 'Instalar CA'}
            </button>
            
            {installStatus === 'error' && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="mr-1 h-4 w-4" />
                <span className="text-sm">Error en la instalación</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Nota:</strong> Después de instalar la CA, reinicia tu navegador para que los cambios surtan efecto.
            </p>
          </div>
        </div>

        {/* Generate New Certificate */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            Generar Nuevo Certificado
          </h2>
          
          <div className="flex space-x-4">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="miapp.local, api.test, etc."
              className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerateCertificate()}
            />
            
            <button
              onClick={handleGenerateCertificate}
              disabled={!newDomain.trim() || isGenerating}
              className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                !newDomain.trim() || isGenerating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isGenerating ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              Generar
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            El certificado se generará automáticamente y se configurará en Apache
          </p>
        </div>

        {/* Certificates List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Certificados Activos</h2>
          
          {domains.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lock className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No hay certificados generados</p>
              <p className="text-sm">Genera tu primer certificado SSL arriba</p>
            </div>
          ) : (
            <div className="space-y-4">
              {domains.map((domain, index) => (
                <div key={index} className="border rounded-lg p-4 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        domain.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <h3 className="font-semibold">{domain.domain}</h3>
                        <p className="text-sm text-gray-500">
                          Puerto {domain.port} • Creado {new Date(domain.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        domain.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {domain.status === 'active' ? 'Activo' : 'Pendiente'}
                      </span>
                      
                      <button
                        onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Abrir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Instrucciones de Uso
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>1. Instala la Certificate Authority en tu sistema</li>
                <li>2. Genera certificados para tus dominios locales (.local, .test)</li>
                <li>3. Accede usando https:// en lugar de http://</li>
                <li>4. Los certificados se renuevan automáticamente cada año</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSLManagerView;
```

#### **C. Backend Integration**
```javascript
// ssl-handler.js
import { ipcMain, dialog } from 'electron'; // pero no se puede usar electron, sino neutralino
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class SSLHandler {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.sslManager = new SSLManager();
  }

  setupHandlers() {
    ipcMain.handle('generate-ssl-certificate', async (event, config) => {
      try {
        const { domain, documentRoot, port = 443 } = config;
        
        // Generate certificate
        await this.sslManager.generateCertificate(domain);
        
        // Configure Apache virtual host
        await this.sslManager.configureApacheSSL(domain, documentRoot, port);
        
        // Add to hosts file
        await this.sslManager.addToHostsFile(domain);
        
        // Restart Apache if running
        await this.restartApache();
        
        return { success: true, domain, port };
      } catch (error) {
        console.error('Error generating SSL certificate:', error);
        throw new Error(`Failed to generate certificate: ${error.message}`);
      }
    });

    ipcMain.handle('install-ca-certificate', async () => {
      try {
        await this.sslManager.installCertificateToSystem();
        return { success: true };
      } catch (error) {
        throw new Error(`Failed to install CA: ${error.message}`);
      }
    });

    ipcMain.handle('list-ssl-certificates', async () => {
      return await this.listCertificates();
    });

    ipcMain.handle('remove-ssl-certificate', async (event, domain) => {
      try {
        await this.removeCertificate(domain);
        return { success: true };
      } catch (error) {
        throw new Error(`Failed to remove certificate: ${error.message}`);
      }
    });
  }

  async restartApache() {
    try {
      await execAsync('net stop Apache2.4 && net start Apache2.4');
      console.log('Apache restarted successfully');
    } catch (error) {
      console.warn('Could not restart Apache automatically:', error.message);
      // Show notification to user
      this.showNotification({
        title: 'Apache Restart Required',
        body: 'Please restart Apache manually to apply SSL configuration',
        type: 'warning'
      });
    }
  }

  async listCertificates() {
    const certsDir = './certs/';
    if (!fs.existsSync(certsDir)) return [];
    
    const files = fs.readdirSync(certsDir);
    const certificates = [];
    
    for (const file of files) {
      if (file.endsWith('.pem') && !file.includes('-key') && !file.includes('ca')) {
        const domain = file.replace('.pem', '');
        const certPath = path.join(certsDir, file);
        const stats = fs.statSync(certPath);
        
        certificates.push({
          domain,
          file: certPath,
          createdAt: stats.birthtime,
          size: stats.size
        });
      }
    }
    
    return certificates;
  }

  showNotification({ title, body, type = 'info' }) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('notification', { title, body, type });
    }
  }
}
```

### **Beneficios Esperados**
- ✅ **HTTPS real** para desarrollo local sin warnings
- ✅ **Certificados automáticos** sin configuración manual
- ✅ **Trust del navegador** con CA local
- ✅ **Soporte para múltiples dominios** (.local, .test, etc.)

---

## 🌐 **11. Virtual Hosts Manager**

### **Objetivo**
Crear una interfaz visual completa para gestionar virtual hosts de Apache, incluyendo creación, edición, eliminación y configuración automática de hosts y DNS local.

### **Implementación Técnica**

#### **A. Virtual Host Manager Class**
```javascript
// src/utils/vhostManager.js
export class VHostManager {
  constructor() {
    this.vhostsDir = './apache/conf/extra/';
    this.hostsFile = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
    this.vhostsConfig = `${this.vhostsDir}httpd-vhosts-custom.conf`;
  }

  async initialize() {
    // Ensure vhosts directory exists
    await this.ensureDirectory();
    
    // Create custom vhosts file if it doesn't exist
    if (!await this.fileExists(this.vhostsConfig)) {
      await this.createVHostsConfig();
    }
    
    // Update main Apache configuration
    await this.updateApacheConfig();
  }

  async createVHost({ domain, path, port = 80, ssl = false, sslPort = 443, description = '' }) {
    try {
      // Validate domain format
      if (!this.isValidDomain(domain)) {
        throw new Error('Formato de dominio inválido');
      }

      // Check if domain already exists
      const existing = await this.getVHost(domain);
      if (existing) {
        throw new Error(`El dominio ${domain} ya existe`);
      }

      // Ensure document root exists
      await this.ensureDirectory(path);

      // Generate virtual host configuration
      const vhostConfig = this.generateVHostConfig({
        domain,
        path,
        port,
        ssl,
        sslPort,
        description
      });

      // Add to vhosts file
      await this.appendToVHostsFile(vhostConfig);

      // Add to hosts file
      await this.addToHostsFile(domain);

      // Update Apache configuration to include vhosts
      await this.updateApacheConfig();

      // Restart Apache
      await this.restartApache();

      console.log(`Virtual host created: ${domain} -> ${path}`);
      return { success: true, domain, path, port, ssl };

    } catch (error) {
      console.error('Error creating virtual host:', error);
      throw error;
    }
  }

  generateVHostConfig({ domain, path, port, ssl, sslPort, description }) {
    const comment = description ? `# ${description}\n` : '';
    
    let config = `${comment}<VirtualHost *:${port}>\n`;
    config += `    ServerName ${domain}\n`;
    config += `    DocumentRoot "${path}"\n`;
    
    // Add aliases
    config += `    ServerAlias www.${domain}\n`;
    
    // SSL Configuration
    if (ssl) {
      config += `\n    # SSL Configuration\n`;
      config += `    SSLEngine on\n`;
      config += `    SSLCertificateFile "./certs/${domain}.pem"\n`;
      config += `    SSLCertificateKeyFile "./certs/${domain}-key.pem"\n`;
    }
    
    // Directory configuration
    config += `\n    <Directory "${path}">\n`;
    config += `        AllowOverride All\n`;
    config += `        Require all granted\n`;
    config += `    </Directory>\n`;
    
    // Logging
    config += `\n    # Logging\n`;
    config += `    ErrorLog "logs/${domain}-error.log"\n`;
    config += `    CustomLog "logs/${domain}-access.log" common\n`;
    
    // Performance
    config += `\n    # Performance\n`;
    config += `    EnableSendfile off\n`;
    config += `    EnableMMAP off\n`;
    
    config += `</VirtualHost>\n\n`;
    
    return config;
  }

  async addToHostsFile(domain) {
    try {
      const hostsContent = await this.readFile(this.hostsFile);
      
      if (!hostsContent.includes(domain)) {
        const newEntry = `\n127.0.0.1 ${domain} www.${domain}\n`;
        await this.writeFile(this.hostsFile, hostsContent + newEntry);
        console.log(`Added ${domain} to hosts file`);
      }
    } catch (error) {
      console.warn(`Could not modify hosts file: ${error.message}`);
      throw new Error(`No se pudo agregar ${domain} al archivo hosts. Ejecute como administrador.`);
    }
  }

  async updateApacheConfig() {
    const httpdConfPath = './apache/conf/httpd.conf';
    const httpdConf = await this.readFile(httpdConfPath);
    
    const includeLine = 'Include conf/extra/httpd-vhosts-custom.conf';
    
    if (!httpdConf.includes(includeLine)) {
      await this.appendToFile(httpdConfPath, `\n# Custom Virtual Hosts\n${includeLine}\n`);
      console.log('Added custom vhosts to Apache configuration');
    }
  }

  async getVHost(domain) {
    const vhostsContent = await this.readFile(this.vhostsConfig);
    
    const vhostRegex = new RegExp(`<VirtualHost \\*:(\\d+)>[\\s\\S]*?ServerName ${domain}[\\s\\S]*?<\\/VirtualHost>`, 'i');
    const match = vhostsContent.match(vhostRegex);
    
    if (match) {
      return {
        domain,
        port: parseInt(match[1]),
        config: match[0]
      };
    }
    
    return null;
  }

  async listVHosts() {
    const vhostsContent = await this.readFile(this.vhostsConfig);
    const vhosts = [];
    
    // Match all virtual hosts
    const vhostRegex = /<VirtualHost \*:\d+>[\s\S]*?<\/VirtualHost>/gi;
    let match;
    
    while ((match = vhostRegex.exec(vhostsContent)) !== null) {
      const vhostConfig = match[0];
      
      // Extract domain
      const domainMatch = vhostConfig.match(/ServerName ([^\s]+)/);
      if (domainMatch) {
        const domain = domainMatch[1];
        const portMatch = vhostConfig.match(/<VirtualHost \*:(\d+)>/);
        const port = portMatch ? parseInt(portMatch[1]) : 80;
        const pathMatch = vhostConfig.match(/DocumentRoot "([^"]+)"/);
        const path = pathMatch ? pathMatch[1] : '';
        const sslEnabled = vhostConfig.includes('SSLEngine on');
        
        vhosts.push({
          domain,
          port,
          path,
          ssl: sslEnabled,
          config: vhostConfig
        });
      }
    }
    
    return vhosts;
  }

  async deleteVHost(domain) {
    try {
      const vhostsContent = await this.readFile(this.vhostsConfig);
      
      // Remove the virtual host configuration
      const vhostRegex = new RegExp(`<VirtualHost \\*:\\d+>[\\s\\S]*?ServerName ${domain}[\\s\\S]*?<\\/VirtualHost>\\s*`, 'i');
      const newContent = vhostsContent.replace(vhostRegex, '');
      
      await this.writeFile(this.vhostsConfig, newContent);
      
      // Remove from hosts file
      await this.removeFromHostsFile(domain);
      
      // Restart Apache
      await this.restartApache();
      
      console.log(`Virtual host deleted: ${domain}`);
      return { success: true };
      
    } catch (error) {
      console.error('Error deleting virtual host:', error);
      throw error;
    }
  }

  async removeFromHostsFile(domain) {
    try {
      const hostsContent = await this.readFile(this.hostsFile);
      const lines = hostsContent.split('\n');
      const filteredLines = lines.filter(line => 
        !line.includes(domain) && !line.trim().startsWith('#') || line.trim() === ''
      );
      
      await this.writeFile(this.hostsFile, filteredLines.join('\n'));
      console.log(`Removed ${domain} from hosts file`);
    } catch (error) {
      console.warn(`Could not modify hosts file: ${error.message}`);
    }
  }

  async restartApache() {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      await execAsync('net stop Apache2.4 && net start Apache2.4');
      console.log('Apache restarted successfully');
    } catch (error) {
      console.warn('Could not restart Apache automatically:', error.message);
      throw new Error('No se pudo reiniciar Apache automáticamente. Reinicie el servicio manualmente.');
    }
  }

  isValidDomain(domain) {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain) && !domain.includes('..');
  }

  async testConfiguration() {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      // Test Apache configuration
      const { stdout, stderr } = await execAsync('apachectl -t');
      
      if (stderr && stderr.includes('Syntax OK')) {
        return { valid: true, message: 'Configuration is valid' };
      } else {
        return { valid: false, message: stderr || 'Unknown configuration error' };
      }
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }

  async createQuickTemplate(template) {
    const templates = {
      'laravel': {
        domain: 'laravel-app.local',
        path: './www/laravel-app/public',
        description: 'Laravel Application'
      },
      'wordpress': {
        domain: 'wordpress.local',
        path: './www/wordpress',
        description: 'WordPress Site'
      },
      'symfony': {
        domain: 'symfony-app.local',
        path: './www/symfony-app/public',
        description: 'Symfony Application'
      },
      'vue': {
        domain: 'vue-app.local',
        path: './www/vue-app/dist',
        description: 'Vue.js Application'
      },
      'react': {
        domain: 'react-app.local',
        path: './www/react-app/build',
        description: 'React Application'
      }
    };

    return templates[template];
  }
}
```

#### **B. React UI for Virtual Hosts Management**
```jsx
// src/Views/VirtualHostsView.jsx
import { useState, useEffect } from 'react';
import { Plus, Globe, Edit, Trash2, ExternalLink, Key, Settings, AlertCircle, CheckCircle } from 'lucide-react';

const VirtualHostsView = () => {
  const [vhosts, setVhosts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingVhost, setEditingVhost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [newVhost, setNewVhost] = useState({
    domain: '',
    path: '',
    port: 80,
    ssl: false,
    description: ''
  });

  const quickTemplates = [
    { id: 'laravel', name: 'Laravel', icon: '🚀', description: 'Aplicación Laravel completa' },
    { id: 'wordpress', name: 'WordPress', icon: '📝', description: 'Sitio WordPress' },
    { id: 'symfony', name: 'Symfony', icon: '⚡', description: 'Aplicación Symfony' },
    { id: 'vue', name: 'Vue.js', icon: '💚', description: 'SPA Vue.js' },
    { id: 'react', name: 'React', icon: '⚛️', description: 'SPA React' },
    { id: 'custom', name: 'Personalizado', icon: '🔧', description: 'Configuración manual' }
  ];

  useEffect(() => {
    loadVhosts();
  }, []);

  const loadVhosts = async () => {
    setIsLoading(true);
    try {
      const data = await window.electronAPI.getVHosts();
      setVhosts(data);
    } catch (error) {
      console.error('Error loading virtual hosts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVhost = async () => {
    if (!newVhost.domain || !newVhost.path) return;

    setIsLoading(true);
    try {
      await window.electronAPI.createVHost(newVhost);
      
      // Reset form
      setNewVhost({
        domain: '',
        path: '',
        port: 80,
        ssl: false,
        description: ''
      });
      
      setShowCreateModal(false);
      loadVhosts();
      
      // Show success notification
      window.electronAPI.showNotification({
        title: 'Virtual Host Creado',
        message: `${newVhost.domain} configurado exitosamente`,
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error creating virtual host:', error);
      window.electronAPI.showNotification({
        title: 'Error',
        message: `No se pudo crear el virtual host: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVhost = async (domain) => {
    if (!confirm(`¿Estás seguro de eliminar el virtual host ${domain}?`)) return;

    setIsLoading(true);
    try {
      await window.electronAPI.deleteVHost(domain);
      loadVhosts();
      
      window.electronAPI.showNotification({
        title: 'Virtual Host Eliminado',
        message: `${domain} eliminado exitosamente`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting virtual host:', error);
      window.electronAPI.showNotification({
        title: 'Error',
        message: `No se pudo eliminar el virtual host: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = async (template) => {
    try {
      const templateConfig = await window.electronAPI.getVHostTemplate(template.id);
      
      if (template.id === 'custom') {
        setShowCreateModal(true);
      } else {
        // Auto-create with template
        await window.electronAPI.createVHost(templateConfig);
        loadVhosts();
        
        window.electronAPI.showNotification({
          title: 'Virtual Host Creado',
          message: `${templateConfig.domain} configurado con template ${template.name}`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const openInBrowser = (domain) => {
    window.open(`http://${domain}`, '_blank');
  };

  const openInEditor = (path) => {
    window.electronAPI.openInVSCode(path);
  };

  return (
    <div className="vhosts-container p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Globe className="mr-3 h-8 w-8 text-blue-500" />
              Virtual Hosts Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gestiona dominios locales y configuración de Apache
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <Settings className="mr-2 h-4 w-4" />
              Templates
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Virtual Host
            </button>
          </div>
        </div>

        {/* Virtual Hosts List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Virtual Hosts Activos</h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Cargando virtual hosts...</p>
            </div>
          ) : vhosts.length === 0 ? (
            <div className="p-8 text-center">
              <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No hay virtual hosts configurados
              </h3>
              <p className="text-gray-500 mb-4">
                Crea tu primer virtual host para empezar
              </p>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Usar Template
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {vhosts.map((vhost, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mr-3">
                          {vhost.domain}
                        </h3>
                        
                        {vhost.ssl && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center">
                            <Key className="mr-1 h-3 w-3" />
                            SSL
                          </span>
                        )}
                        
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Puerto {vhost.port}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                        <strong>Ruta:</strong> {vhost.path}
                      </p>
                      
                      {vhost.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {vhost.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => openInBrowser(vhost.domain)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Abrir en navegador"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => openInEditor(vhost.path)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                        title="Abrir en editor"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteVhost(vhost.domain)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Estado del Sistema
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Apache:</span>
                <span className="text-green-600">Activo</span>
              </div>
              <div className="flex justify-between">
                <span>Virtual Hosts:</span>
                <span>{vhosts.length} configurados</span>
              </div>
              <div className="flex justify-between">
                <span>SSL:</span>
                <span>{vhosts.filter(v => v.ssl).length} activos</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2 flex items-center">
              <Settings className="mr-2 h-5 w-5 text-blue-500" />
              Configuración
            </h3>
            <div className="space-y-2 text-sm">
              <button 
                onClick={() => window.electronAPI.testApacheConfig()}
                className="w-full text-left hover:text-blue-600"
              >
                Probar configuración Apache
              </button>
              <button 
                onClick={() => window.electronAPI.restartApache()}
                className="w-full text-left hover:text-blue-600"
              >
                Reiniciar Apache
              </button>
              <button 
                onClick={() => window.electronAPI.openApacheLog()}
                className="w-full text-left hover:text-blue-600"
              >
                Ver logs de Apache
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2 flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
              Ayuda
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>• Usa .local o .test para dominios locales</p>
              <p>• Los cambios requieren reinicio de Apache</p>
              <p>• El archivo hosts se modifica automáticamente</p>
            </div>
          </div>
        </div>

        {/* Create Virtual Host Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold mb-4">Crear Virtual Host</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dominio</label>
                  <input
                    type="text"
                    value={newVhost.domain}
                    onChange={(e) => setNewVhost({...newVhost, domain: e.target.value})}
                    placeholder="miapp.local"
                    className="w-full p-2 border rounded dark:bg-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Ruta del Document Root</label>
                  <input
                    type="text"
                    value={newVhost.path}
                    onChange={(e) => setNewVhost({...newVhost, path: e.target.value})}
                    placeholder="./www/miapp/public"
                    className="w-full p-2 border rounded dark:bg-gray-700"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Puerto</label>
                    <input
                      type="number"
                      value={newVhost.port}
                      onChange={(e) => setNewVhost({...newVhost, port: parseInt(e.target.value)})}
                      className="w-full p-2 border rounded dark:bg-gray-700"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ssl"
                      checked={newVhost.ssl}
                      onChange={(e) => setNewVhost({...newVhost, ssl: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="ssl" className="text-sm">SSL/HTTPS</label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción (Opcional)</label>
                  <input
                    type="text"
                    value={newVhost.description}
                    onChange={(e) => setNewVhost({...newVhost, description: e.target.value})}
                    placeholder="Descripción del proyecto"
                    className="w-full p-2 border rounded dark:bg-gray-700"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateVhost}
                  disabled={!newVhost.domain || !newVhost.path || isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
              <h2 className="text-xl font-semibold mb-4">Templates Rápidos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{template.icon}</span>
                      <h3 className="font-semibold">{template.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {template.description}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualHostsView;
```

#### **C. Backend Integration**
```javascript
// vhost-handler.js
import { ipcMain } from 'electron'; // pero no se puede usar electron, sino neutralino
import path from 'path';
import fs from 'fs';

export class VHostHandler {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.vHostManager = new VHostManager();
  }

  setupHandlers() {
    ipcMain.handle('create-vhost', async (event, config) => {
      try {
        const result = await this.vHostManager.createVHost(config);
        return result;
      } catch (error) {
        throw new Error(`Failed to create virtual host: ${error.message}`);
      }
    });

    ipcMain.handle('get-vhosts', async () => {
      try {
        const vhosts = await this.vHostManager.listVHosts();
        return vhosts;
      } catch (error) {
        console.error('Error getting virtual hosts:', error);
        return [];
      }
    });

    ipcMain.handle('delete-vhost', async (event, domain) => {
      try {
        const result = await this.vHostManager.deleteVHost(domain);
        return result;
      } catch (error) {
        throw new Error(`Failed to delete virtual host: ${error.message}`);
      }
    });

    ipcMain.handle('test-apache-config', async () => {
      try {
        const result = await this.vHostManager.testConfiguration();
        return result;
      } catch (error) {
        return { valid: false, message: error.message };
      }
    });

    ipcMain.handle('restart-apache', async () => {
      try {
        await this.vHostManager.restartApache();
        return { success: true };
      } catch (error) {
        throw new Error(`Failed to restart Apache: ${error.message}`);
      }
    });

    ipcMain.handle('get-vhost-template', async (event, templateId) => {
      try {
        const template = await this.vHostManager.createQuickTemplate(templateId);
        return template;
      } catch (error) {
        throw new Error(`Template not found: ${templateId}`);
      }
    });
  }
}
```

### **Beneficios Esperados**
- ✅ **Gestión visual** de virtual hosts sin editar archivos manualmente
- ✅ **Templates predefinidos** para tecnologías comunes (Laravel, WordPress, Vue, etc.)
- ✅ **Configuración automática** de DNS local y Apache
- ✅ **Validación** de configuraciones antes de aplicar cambios

---

## 📋 **Cronograma de Implementación**

| Fase | Funcionalidad | Tiempo Estimado | Prioridad |
|------|---------------|-----------------|-----------|
| **Fase 1** | Virtual Hosts Manager | 3-4 días | 🔴 Alta |
| **Fase 2** | Dashboard de Métricas | 2-3 días | 🔴 Alta |
| **Fase 3** | SSL/HTTPS Local | 4-5 días | 🟡 Media |

**Total estimado**: 9-12 días de desarrollo

---

## 🔧 **Consideraciones Técnicas**

### **Dependencias**
- OpenSSL (incluido en Windows)
- Permisos de administrador para modificar hosts
- Módulo SSL de Apache

### **Compatibilidad**
- Windows 10/11
- Apache 2.4+
- Node.js 18+

### **Fallbacks**
- Si no se puede modificar hosts automáticamente → mostrar instrucciones
- Si Apache no se puede reiniciar automáticamente → notificar usuario
- Si SSL falla → continuar con HTTP normal

---


