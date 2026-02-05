import { execSync } from 'child_process';

async function testReliableProcessDetection() {
    console.log('=== Test de Detección Confiable de Procesos ===');

    const port = 3306;
    const expectedProcess = 'mysqld.exe';

    try {
        console.log(`\n🔍 Probando estrategia confiable para puerto ${port} y proceso ${expectedProcess}`);
        console.log('=' .repeat(60));

        // Paso 1: Verificar si el puerto está en uso con netstat
        console.log('\n1️⃣ Verificando puerto con netstat -ano...');
        try {
            const netstatOutput = execSync(`netstat -ano | findstr :${port}`).toString();
            console.log('Netstat output:', netstatOutput.trim());

            if (netstatOutput.includes(port.toString())) {
                console.log('✅ Puerto está en uso');

                // Extraer PID del output de netstat
                const lines = netstatOutput.trim().split('\n');
                const lastLine = lines[lines.length - 1];
                const parts = lastLine.trim().split(/\s+/);
                const pid = parts[parts.length - 1];

                console.log(`📍 PID encontrado: ${pid}`);

                // Paso 2: Obtener nombre del proceso usando el PID
                console.log('\n2️⃣ Obteniendo nombre del proceso con tasklist /FI "PID eq PID"...');
                try {
                    const tasklistOutput = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`).toString();
                    console.log('Tasklist output:', tasklistOutput.trim());

                    // Extraer nombre del proceso del CSV
                    const match = tasklistOutput.match(/"([^"]+)"/);
                    const processName = match ? match[1] : null;

                    console.log(`🏷️ Nombre del proceso: ${processName}`);

                    // Paso 3: Verificar si es el proceso esperado
                    console.log('\n3️⃣ Verificando si es el proceso esperado...');
                    const isExpectedProcess = processName && processName.toLowerCase() === expectedProcess.toLowerCase();

                    console.log(`🔍 Proceso esperado: ${expectedProcess}`);
                    console.log(`⚖️ Coincide: ${isExpectedProcess}`);

                    if (isExpectedProcess) {
                        console.log('\n🎉 ¡ESTRATEGIA CONFIRMA QUE EL SERVICIO ESTÁ CORRIENDO!');
                        console.log(`✅ ${expectedProcess} está usando el puerto ${port} (PID: ${pid})`);
                    } else {
                        console.log('\n⚠️ El puerto está ocupado por otro proceso');
                        console.log(`❌ Puerto ${port} ocupado por ${processName} (PID: ${pid}), no por ${expectedProcess}`);
                    }

                } catch (e) {
                    console.log('❌ Error obteniendo nombre del proceso:', e.message);
                }

            } else {
                console.log('❌ Puerto no está en uso');
            }
        } catch (e) {
            console.log('❌ Error ejecutando netstat:', e.message);
        }

        // Comparación con método anterior (menos confiable)
        console.log('\n' + '='.repeat(60));
        console.log('📊 COMPARACIÓN CON MÉTODO ANTERIOR (tasklist por nombre)');
        console.log('='.repeat(60));

        try {
            const oldMethodOutput = execSync('tasklist /FI "IMAGENAME eq mysqld.exe" /NH /FO CSV').toString();
            console.log('Tasklist por nombre output:', oldMethodOutput.trim());

            if (oldMethodOutput.includes('mysqld.exe')) {
                console.log('✅ Método anterior: mysqld.exe encontrado');
            } else {
                console.log('❌ Método anterior: mysqld.exe NO encontrado');
            }
        } catch (e) {
            console.log('❌ Error en método anterior:', e.message);
        }

    } catch (error) {
        console.error('Error en test:', error);
    }
}

testReliableProcessDetection();