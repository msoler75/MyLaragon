# Principios Universales de Desarrollo de Software
## Base para Cualquier Proyecto

Esta guía establece principios fundamentales que deben aplicarse a cualquier proyecto de software profesional, independientemente del stack tecnológico o dominio.

---

## 🎯 Principios Fundamentales

### 1. **DRY Extremo (Don't Repeat Yourself)**
- **Nunca** duplicar funcionalidades en toda la aplicación
- Si existe código similar en dos lugares → refactorizar inmediatamente
- Crear funciones/utilidades/componentes/servicios compartidos
- Mantener una única fuente de verdad para cada concepto

### 2. **Single Source of Truth (Fuente Única de Verdad)**
- Identificar y documentar cuál es la fuente de verdad para cada aspecto del sistema
- Evitar copias o sincronizaciones manuales que puedan desincronizarse
- Establecer flujos de generación/construcción claros y automatizados
- Documentar qué archivos son generados y cuáles son fuente

### 3. **Autonomía del Asistente AI**
- **Los logs son la fuente primaria de información para debugging**
- Antes de pedir ayuda al usuario, revisar logs/salidas de terminal
- Identificar qué falló y por qué a través de análisis de logs
- **Instrumentación Proactiva**: Si los logs no son suficientes, inyectar más logging
- Corregir errores de forma autónoma cuando sea posible
- Solo contactar al usuario para decisiones de negocio o intervenciones físicas

### 4. **Nunca Supongas, Siempre Verifica**
- Nunca decir "esto debería funcionar" sin comprobarlo
- Usar herramientas de logging y testing para validar
- Si algo no está claro: investigar o preguntar
- No dar nada por sentado
- Verificar estado real antes de hacer cambios

### 5. **Nunca Molestes ni Delegues Innecesariamente**
- Evitar molestar al usuario si puedes resolverlo tú mismo
- No pedir al usuario que ejecute comandos que tú puedes ejecutar
- Consultar logs para verificar estado antes de preguntar
- Solo pedir ayuda cuando no quede otro remedio
- Ser proactivo en la resolución de problemas

### 6. **Testing Realista y Sin Trampas**
- Los tests deben probar partes **reales** del sistema
- Si los tests pasan, la app debe comportarse igual en producción
- **Prohibido** hacer trampas (mocks falsos, respuestas simuladas, etc.)
- Cubrir flujos críticos con tests exhaustivos
- Los tests son documentación ejecutable del comportamiento esperado

### 7. **Consistencia entre Entornos**
- Dev, Staging y Prod deben comportarse de forma idéntica
- Minimizar diferencias entre entornos
- Si hay discrepancias, refactorizar para unificar lógica
- Evitar bugs del tipo "works on my machine"
- Documentar y justificar cualquier diferencia necesaria

### 8. **Logging Estratégico**
- Implementar un sistema de logging unificado
- No crear sistemas de log paralelos o fragmentados
- Logs deben ser informativos y accionables
- Incluir contexto técnico: variables, rutas, códigos de error
- Niveles apropiados: debug, info, warn, error
- Los logs deben permitir reconstruir el flujo de ejecución

### 9. **Configuración Dinámica sobre Hardcoding**
- Evitar rutas absolutas y valores hardcoded
- Usar variables de entorno y archivos de configuración
- Resolver rutas y valores dinámicamente
- Facilitar el despliegue en diferentes entornos
- Documentar todas las configuraciones necesarias

### 10. **Documentación como Código**
- La documentación debe estar junto al código
- Mantener docs actualizadas al cambiar el código
- Documentar el "por qué", no solo el "qué"
- Incluir ejemplos de uso reales
- La mejor documentación es código auto-explicativo

---

## 📋 Metodologías de Trabajo

### Gestión de Tareas y Productividad
- **Marcos de Objetivos**: SMART, OKR para definir metas claras
- **Priorización**: GTD, Matriz de Eisenhower, principio de las "Tres Grandes Tareas"
- **Eliminación**: Tareas no prioritarias deben eliminarse, posponerse o delegarse
- **Foco**: Concentrar esfuerzo en tareas de alto impacto
- **Revisión**: Sistema de auto-revisión para rastrear progreso

### Flujo de Trabajo de Desarrollo
1. **Entender el problema**: Antes de codificar, comprender completamente el contexto
2. **Planificar**: Diseñar la solución considerando principios y arquitectura
3. **Implementar**: Código limpio, siguiendo convenciones del proyecto
4. **Probar**: Tests automáticos que validen el comportamiento real
5. **Verificar**: Revisar logs, comportamiento, performance
6. **Documentar**: Actualizar docs relevantes
7. **Revisar**: Code review y mejora continua

### Debugging Sistemático
1. **Recopilar información**: Logs, stack traces, estado del sistema
2. **Reproducir**: Crear un caso de prueba reproducible
3. **Aislar**: Identificar componente/función específica con el problema
4. **Instrumentar**: Añadir logging si es necesario
5. **Hipótesis**: Formular hipótesis sobre la causa
6. **Validar**: Probar la hipótesis con datos reales
7. **Corregir**: Implementar la solución
8. **Verificar**: Confirmar que el problema está resuelto
9. **Prevenir**: Añadir tests para evitar regresiones

---

## 🛠️ Mejores Prácticas Técnicas

### Arquitectura
- Separación clara de responsabilidades (SoC)
- Capas bien definidas (presentación, lógica, datos)
- Dependencias explícitas y minimizadas
- Acoplamiento bajo, cohesión alta
- Diseño modular y componible

### Código
- Nombres descriptivos y auto-explicativos
- Funciones pequeñas y con responsabilidad única
- Evitar efectos secundarios inesperados
- Manejo explícito de errores
- Código defensivo sin paranoia excesiva

### Control de Versiones
- Commits atómicos y descriptivos
- Mensajes de commit significativos
- Branches con propósito claro
- Pull/Merge requests con contexto
- Historia limpia y navegable

### Testing
- Tests unitarios para lógica de negocio
- Tests de integración para flujos completos
- Tests end-to-end para casos de usuario críticos
- Coverage significativo, no solo numérico
- Tests rápidos y confiables

---

## 🔄 Ciclo de Mejora Continua

### Revisión Regular
- **Diaria**: Estado de tareas, blockers, próximos pasos
- **Semanal**: Progreso de objetivos, calidad del código, deuda técnica
- **Mensual**: Logros, aprendizajes, mejoras de proceso
- **Trimestral**: Arquitectura, escalabilidad, alineación con objetivos

### Métricas de Salud del Proyecto
- Cobertura de tests y confiabilidad
- Deuda técnica acumulada
- Tiempo de resolución de bugs
- Performance y latencias
- Facilidad de onboarding de nuevos desarrolladores
- Satisfacción del equipo y del usuario final

### Evolución del Sistema
- Refactoring continuo para mantener calidad
- Actualización de dependencias de forma controlada
- Evaluación periódica de herramientas y tecnologías
- Balance entre innovación y estabilidad
- Documentación de decisiones arquitectónicas (ADRs)

---

## 🎓 Mentalidad del Desarrollador Profesional

### Responsabilidad
- Ownership del código que escribes
- Pensar en mantenibilidad a largo plazo
- Considerar impacto en otros desarrolladores
- Dejar el código mejor de como lo encontraste

### Colaboración
- Code reviews constructivos
- Compartir conocimiento proactivamente
- Pedir ayuda cuando sea necesario
- Documentar para tu yo futuro y tus compañeros

### Aprendizaje Continuo
- Mantenerse actualizado con mejores prácticas
- Experimentar con nuevas herramientas y técnicas
- Aprender de los errores propios y ajenos
- Contribuir a la comunidad

### Pragmatismo
- Balance entre perfección y entrega
- Soluciones simples sobre complejas (KISS)
- Medir antes de optimizar
- Iterar basándose en feedback real

---

## 📖 Recursos y Referencias

### Libros Recomendados
- "Clean Code" - Robert C. Martin
- "The Pragmatic Programmer" - Hunt & Thomas
- "Refactoring" - Martin Fowler
- "Domain-Driven Design" - Eric Evans
- "Working Effectively with Legacy Code" - Michael Feathers

### Principios de Diseño
- SOLID (Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion)
- KISS (Keep It Simple, Stupid)
- YAGNI (You Aren't Gonna Need It)
- DRY (Don't Repeat Yourself)
- Composition over Inheritance
- Fail Fast
- Principle of Least Surprise

### Patterns y Anti-patterns
- Conocer patrones de diseño comunes
- Reconocer anti-patterns y code smells
- Aplicar patrones con criterio, no dogmáticamente
- Refactorizar hacia patterns cuando sea necesario

---

## ✅ Checklist para Cualquier Tarea

Antes de considerar una tarea como completa:

- [ ] ¿El código sigue el principio DRY?
- [ ] ¿Hay una única fuente de verdad clara?
- [ ] ¿Los tests son realistas y pasan?
- [ ] ¿El comportamiento es consistente entre entornos?
- [ ] ¿Los logs son suficientemente informativos?
- [ ] ¿La configuración es dinámica y documentada?
- [ ] ¿El código está documentado adecuadamente?
- [ ] ¿Se han verificado los resultados (no solo asumido)?
- [ ] ¿Es fácil de entender para otro desarrollador?
- [ ] ¿Podría el sistema depurarse a sí mismo con los logs actuales?

---

*Esta base debe adaptarse a las especificidades de cada proyecto, pero los principios fundamentales permanecen universales.*
