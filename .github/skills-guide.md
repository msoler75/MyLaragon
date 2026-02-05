# Guía de Skills Recomendadas para Base Universal

Esta guía complementa los [Principios Universales](./universal-copilot-base.md) con skills específicas que apoyan y refuerzan cada aspecto fundamental del desarrollo profesional.

## 📊 Resumen Ejecutivo

He extraído **10 principios universales** del archivo copilot-instructions.md que son aplicables a cualquier proyecto de software profesional, independientemente del stack tecnológico. Estos principios cubren:

1. **DRY Extremo** - Evitar duplicación de código
2. **Single Source of Truth** - Fuente única de verdad
3. **Autonomía del Asistente AI** - Debugging proactivo vía logs
4. **Nunca Supongas** - Siempre verificar
5. **Nunca Molestes** - Resolver antes de preguntar
6. **Testing Realista** - Sin trampas ni mocks falsos
7. **Consistencia entre Entornos** - Dev = Prod
8. **Logging Estratégico** - Sistema unificado
9. **Configuración Dinámica** - Sin hardcoding
10. **Documentación como Código** - Docs junto al código

---

## 🎯 Skills Recomendadas (Ya Instaladas)

Las siguientes skills están **actualmente instaladas** y se alinean perfectamente con los principios universales:

### 1. **architecture-design**
**Apoya:** Principios de arquitectura, SoC, modularidad, decisiones estratégicas

**Cuándo usar:**
- Diseñar nuevos sistemas o subsistemas
- Refactorings mayores que afecten múltiples componentes
- Selección de tecnologías
- Definir boundaries e interfaces del sistema

**Principios relacionados:** DRY, Single Source of Truth, Consistencia entre Entornos

---

### 2. **documentation-expert**
**Apoya:** Documentación como Código, estructura, cohesión, experiencia de usuario

**Cuándo usar:**
- Problemas de calidad en documentación
- Organización de contenido
- Duplicación en docs
- Problemas de navegación o legibilidad

**Principios relacionados:** Documentación como Código, Nunca Supongas

---

### 3. **project-planning**
**Apoya:** Planificación estructurada, desglose de tareas, gestión de dependencias

**Cuándo usar:**
- Transformar especificaciones en planes de implementación
- Diseño de arquitectura y desglose de tareas
- Análisis de dependencias
- Sprint planning

**Principios relacionados:** Todos los principios (skill paraguas)

---

### 4. **spec-driven-implementation**
**Apoya:** TDD, testing realista, ciclo Red-Green-Refactor, progreso rastreable

**Cuándo usar:**
- Listo para implementar features diseñadas
- Cuando dices "implement this", "let's code", "start execution"
- Necesitas romper diseño en tareas TDD
- Quieres tracking de progreso

**Principios relacionados:** Testing Realista, Nunca Supongas, Siempre Verificar

---

### 5. **task-breakdown**
**Apoya:** Desglose sistemático, tareas accionables, progreso incremental

**Cuándo usar:**
- Diseño completado y aprobado
- Listo para comenzar implementación
- Coordinar trabajo entre desarrolladores
- Tracking de progreso incremental

**Principios relacionados:** Documentación, Planificación, Organización

---

### 6. **overseer** (Gestión de Tareas Multi-Sesión)
**Apoya:** Tracking de trabajo entre sesiones, persistencia de contexto

**Cuándo usar:**
- Trabajo que abarca múltiples sesiones
- Necesitas persistir contexto para handoffs
- Tracking de implementación compleja

**Principios relacionados:** Nunca Supongas, Gestión Sistemática

---

## 🚀 Skills Adicionales Recomendadas

### Skills ya disponibles en tu instalación:

#### **find-skills**
**Función:** Descubre e instala skills adicionales cuando necesites capacidades específicas

**Útil para:** Expandir capacidades según necesidades emergentes

---

#### **legacy-codebase-analyzer**
**Función:** Análisis de deuda técnica, vulnerabilidades, bottlenecks de performance

**Principios relacionados:** Testing, Calidad de Código, Mejora Continua

**Casos de uso:**
- Assessment de deuda técnica
- Escaneo de vulnerabilidades de seguridad
- Detección de bottlenecks de performance
- Roadmaps de modernización

---

### 🆕 Skills Descubiertas del Ecosistema (Instalar según necesidad)

#### **Categoría: Testing & TDD**

##### `pproenca/dot-skills@tdd`
**Apoya:** Testing Realista, TDD estricto, Red-Green-Refactor
```bash
npx skills add pproenca/dot-skills@tdd -g -y
```
**Cuándo usar:** Proyectos que requieren disciplina TDD rigurosa

##### `svenja-dev/claude-code-skills@tdd-strict`
**Apoya:** TDD estricto con enforcement de reglas
```bash
npx skills add svenja-dev/claude-code-skills@tdd-strict -g -y
```
**Cuándo usar:** Necesitas guía estricta en ciclo Red-Green-Refactor

##### `pproenca/dot-skills@playwright`
**Apoya:** Testing end-to-end realista
```bash
npx skills add pproenca/dot-skills@playwright -g -y
```
**Cuándo usar:** Testing de UI/UX en aplicaciones web

---

#### **Categoría: Calidad de Código**

##### `asyrafhussin/agent-skills@clean-code-principles`
**Apoya:** DRY, SOLID, Clean Code, Legibilidad
```bash
npx skills add asyrafhussin/agent-skills@clean-code-principles -g -y
```
**Cuándo usar:** Refactoring, code reviews, onboarding de equipo

##### `pproenca/dot-skills@clean-code`
**Apoya:** Principios de Clean Code de Robert C. Martin
```bash
npx skills add pproenca/dot-skills@clean-code -g -y
```
**Cuándo usar:** Mejorar legibilidad y mantenibilidad del código

##### `github/awesome-copilot@refactor`
**Apoya:** Refactoring sistemático, eliminación de duplicación
```bash
npx skills add github/awesome-copilot@refactor -g -y
```
**Cuándo usar:** Refactorings mayores, deuda técnica, aplicar DRY

##### `sitechfromgeorgia/georgian-distribution-system@code-quality-guardian`
**Apoya:** Vigilancia continua de calidad de código
```bash
npx skills add sitechfromgeorgia/georgian-distribution-system@code-quality-guardian -g -y
```
**Cuándo usar:** Mantener estándares de calidad en equipos

---

#### **Categoría: Debugging & Logging**

##### `boristane/agent-skills@logging-best-practices`
**Apoya:** Logging Estratégico, Autonomía del AI, Sistema Unificado
```bash
npx skills add boristane/agent-skills@logging-best-practices -g -y
```
**Cuándo usar:** Implementar/mejorar sistema de logging en proyecto

##### `bbeierle12/skill-mcp-claude@systematic-debugging`
**Apoya:** Nunca Supongas, Debugging Proactivo, Resolución Autónoma
```bash
npx skills add bbeierle12/skill-mcp-claude@systematic-debugging -g -y
```
**Cuándo usar:** Debugging complejo, bugs difíciles de reproducir

##### `sitechfromgeorgia/georgian-distribution-system@intelligent-debugger`
**Apoya:** Debugging asistido por AI, análisis de logs
```bash
npx skills add sitechfromgeorgia/georgian-distribution-system@intelligent-debugger -g -y
```
**Cuándo usar:** Problemas de producción, análisis de crashes

---

#### **Categoría: Seguridad**

##### `getsentry/skills@security-review`
**Apoya:** Testing Realista, Verificación de Seguridad
```bash
npx skills add getsentry/skills@security-review -g -y
```
**Cuándo usar:** Code reviews con foco en seguridad

##### `erichowens/some_claude_skills@security-auditor`
**Apoya:** Auditoría de seguridad, detección de vulnerabilidades
```bash
npx skills add erichowens/some_claude_skills@security-auditor -g -y
```
**Cuándo usar:** Antes de releases, auditorías periódicas

---

#### **Categoría: Performance**

##### `addyosmani/web-quality-skills@performance`
**Apoya:** Optimización, Mejora Continua, Métricas de Calidad
```bash
npx skills add addyosmani/web-quality-skills@performance -g -y
```
**Cuándo usar:** Optimización de aplicaciones web

##### `wshobson/agents@python-performance-optimization`
**Apoya:** Performance de Python, profiling, optimización
```bash
npx skills add wshobson/agents@python-performance-optimization -g -y
```
**Cuándo usar:** Proyectos Python con problemas de rendimiento

##### `eddiebe147/claude-settings@performance-optimization`
**Apoya:** Optimización general multiplataforma
```bash
npx skills add eddiebe147/claude-settings@performance-optimization -g -y
```
**Cuándo usar:** Mejora de performance en cualquier stack

---

#### **Categoría: Arquitectura & APIs**

##### `aj-geddes/useful-ai-prompts@rest-api-design`
**Apoya:** Consistencia, Single Source of Truth, Diseño de APIs
```bash
npx skills add aj-geddes/useful-ai-prompts@rest-api-design -g -y
```
**Cuándo usar:** Diseñar nuevas APIs REST

##### `asyrafhussin/agent-skills@api-design-patterns`
**Apoya:** Patrones de diseño de APIs, mejores prácticas
```bash
npx skills add asyrafhussin/agent-skills@api-design-patterns -g -y
```
**Cuándo usar:** Arquitectura de microservicios, APIs públicas

---

#### **Categoría: Git & Workflow**

##### `eddiebe147/claude-settings@git-workflow-designer`
**Apoya:** Single Source of Truth, Control de Versiones, Workflows
```bash
npx skills add eddiebe147/claude-settings@git-workflow-designer -g -y
```
**Cuándo usar:** Diseñar flujos de trabajo con Git para equipos

##### `personamanagmentlayer/pcl@git-expert`
**Apoya:** Maestría en Git, resolución de conflictos, estrategias avanzadas
```bash
npx skills add personamanagmentlayer/pcl@git-expert -g -y
```
**Cuándo usar:** Problemas complejos con Git, estrategias de branching

---

#### **Categoría: Code Review**

##### `supercent-io/skills-template@code-review`
**Apoya:** Nunca Supongas, Verificación, Calidad de Código
```bash
npx skills add supercent-io/skills-template@code-review -g -y
```
**Cuándo usar:** Establecer proceso de code review en equipo

---

---

### 🎯 Recomendaciones de Instalación por Principio Universal

Esta tabla te ayuda a decidir qué skills instalar según qué principios quieres reforzar:

| Principio Universal | Skills Recomendadas | Prioridad |
|---------------------|---------------------|-----------|
| **1. DRY Extremo** | `github/awesome-copilot@refactor`<br>`asyrafhussin/agent-skills@clean-code-principles` | ⭐⭐⭐ Alta |
| **2. Single Source of Truth** | `eddiebe147/claude-settings@git-workflow-designer`<br>`personamanagmentlayer/pcl@git-expert` | ⭐⭐⭐ Alta |
| **3. Autonomía del AI** | `boristane/agent-skills@logging-best-practices`<br>`bbeierle12/skill-mcp-claude@systematic-debugging` | ⭐⭐⭐ Crítica |
| **4. Nunca Supongas** | `bbeierle12/skill-mcp-claude@systematic-debugging`<br>`supercent-io/skills-template@code-review` | ⭐⭐⭐ Alta |
| **5. Nunca Molestes** | `sitechfromgeorgia/georgian-distribution-system@intelligent-debugger`<br>`boristane/agent-skills@logging-best-practices` | ⭐⭐ Media |
| **6. Testing Realista** | `pproenca/dot-skills@tdd`<br>`svenja-dev/claude-code-skills@tdd-strict`<br>`pproenca/dot-skills@playwright` | ⭐⭐⭐ Crítica |
| **7. Consistencia Dev/Prod** | `eddiebe147/claude-settings@git-workflow-designer` | ⭐⭐ Media |
| **8. Logging Estratégico** | `boristane/agent-skills@logging-best-practices` | ⭐⭐⭐ Crítica |
| **9. Configuración Dinámica** | `aj-geddes/useful-ai-prompts@rest-api-design`<br>`asyrafhussin/agent-skills@api-design-patterns` | ⭐⭐ Media |
| **10. Docs como Código** | *Ya tienes `documentation-expert`* | ✅ Cubierto |

---

### 🥇 Top 5 Skills Prioritarias para Instalar YA

Basándome en los principios universales y su impacto, estas son las **5 skills más importantes** para instalar primero:

#### 1️⃣ **boristane/agent-skills@logging-best-practices** (CRÍTICO)
```bash
npx skills add boristane/agent-skills@logging-best-practices -g -y
```
**Por qué:** Apoya 3 principios críticos (Autonomía, Nunca Molestes, Logging Estratégico). El logging es la base del debugging autónomo.

---

#### 2️⃣ **pproenca/dot-skills@tdd** (CRÍTICO)
```bash
npx skills add pproenca/dot-skills@tdd -g -y
```
**Por qué:** Testing Realista es fundamental. TDD asegura que tus tests sean significativos y no tramposos.

---

#### 3️⃣ **asyrafhussin/agent-skills@clean-code-principles** (ALTA)
```bash
npx skills add asyrafhussin/agent-skills@clean-code-principles -g -y
```
**Por qué:** Refuerza DRY, SOLID y legibilidad. Base de código de calidad profesional.

---

#### 4️⃣ **bbeierle12/skill-mcp-claude@systematic-debugging** (ALTA)
```bash
npx skills add bbeierle12/skill-mcp-claude@systematic-debugging -g -y
```
**Por qué:** Apoya "Nunca Supongas" y "Autonomía". Debugging sistemático reduce tiempo de resolución.

---

#### 5️⃣ **github/awesome-copilot@refactor** (ALTA)
```bash
npx skills add github/awesome-copilot@refactor -g -y
```
**Por qué:** Refactoring sistemático = DRY extremo. Elimina duplicación proactivamente.

---

### 📦 Instalación Rápida (Top 5)

Si quieres instalar las 5 prioritarias de una vez:

```bash
# Instalación de las Top 5 Skills
npx skills add boristane/agent-skills@logging-best-practices -g -y
npx skills add pproenca/dot-skills@tdd -g -y
npx skills add asyrafhussin/agent-skills@clean-code-principles -g -y
npx skills add bbeierle12/skill-mcp-claude@systematic-debugging -g -y
npx skills add github/awesome-copilot@refactor -g -y
```

---

### 🎨 Instalación por Caso de Uso

#### Caso: "Tengo muchos bugs en producción"
```bash
npx skills add boristane/agent-skills@logging-best-practices -g -y
npx skills add bbeierle12/skill-mcp-claude@systematic-debugging -g -y
npx skills add sitechfromgeorgia/georgian-distribution-system@intelligent-debugger -g -y
```

#### Caso: "Mi código tiene mucha duplicación"
```bash
npx skills add github/awesome-copilot@refactor -g -y
npx skills add asyrafhussin/agent-skills@clean-code-principles -g -y
npx skills add sitechfromgeorgia/georgian-distribution-system@code-quality-guardian -g -y
```

#### Caso: "Mis tests no son confiables"
```bash
npx skills add pproenca/dot-skills@tdd -g -y
npx skills add svenja-dev/claude-code-skills@tdd-strict -g -y
npx skills add pproenca/dot-skills@playwright -g -y
```

#### Caso: "Necesito mejorar seguridad"
```bash
npx skills add getsentry/skills@security-review -g -y
npx skills add erichowens/some_claude_skills@security-auditor -g -y
```

#### Caso: "Problemas de rendimiento"
```bash
npx skills add addyosmani/web-quality-skills@performance -g -y
npx skills add eddiebe147/claude-settings@performance-optimization -g -y
```

---

## 📋 Plan de Acción Sugerido

### Paso 1: Familiarízate con las Skills Instaladas
Revisa la documentación completa de cada skill instalada:
- `c:\Users\msole\.claude\skills\architecture-design\SKILL.md`
- `c:\Users\msole\.claude\skills\documentation-expert\SKILL.md`
- `c:\Users\msole\.claude\skills\project-planning\SKILL.md`
- `c:\Users\msole\.claude\skills\spec-driven-implementation\SKILL.md`
- `c:\Users\msole\.claude\skills\task-breakdown\SKILL.md`

### Paso 2: Aplica los Principios Universales
Usa el checklist del archivo [universal-copilot-base.md](./universal-copilot-base.md) para validar cada tarea.

### Paso 3: Integra Skills en tu Flujo
1. **Planificación**: `project-planning` → Arquitectura y roadmap
2. **Diseño**: `architecture-design` → Decisiones estratégicas
3. **Desglose**: `task-breakdown` → Tareas accionables
4. **Implementación**: `spec-driven-implementation` → TDD y ejecución
5. **Documentación**: `documentation-expert` → Docs de calidad
6. **Tracking**: `overseer` → Seguimiento multi-sesión

### Paso 4: Considera Skills Adicionales
Si trabajas con:
- **Legacy code**: Instala `legacy-codebase-analyzer`
- **Necesitas nuevas capacidades**: Usa `find-skills`

---

## 🎓 Workflow Recomendado

### Workflow Extendido (Con Skills Adicionales)

```
┌─────────────────────────────────────────┐
│  1. PLANIFICACIÓN                       │
│     (project-planning)                  │
│     • Especificaciones → Plan           │
│     • Arquitectura inicial              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  2. DISEÑO DE ARQUITECTURA              │
│     (architecture-design)               │
│     • Decisiones estratégicas           │
│     • Componentes y boundaries          │
│     • Patrones y tecnologías            │
│     + rest-api-design (si aplica)       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  3. DESGLOSE DE TAREAS                  │
│     (task-breakdown)                    │
│     • Tareas accionables                │
│     • Dependencias claras               │
│     • Criterios de completitud          │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  4. IMPLEMENTACIÓN TDD                  │
│     (spec-driven-implementation)        │
│     + tdd / tdd-strict                  │
│     • Red-Green-Refactor                │
│     • Tests primero                     │
│     • Verificación continua             │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  5. REFACTORING & LIMPIEZA              │
│     + refactor                          │
│     + clean-code-principles             │
│     • Eliminar duplicación              │
│     • Aplicar patrones                  │
│     • Mejorar legibilidad               │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  6. CODE REVIEW & CALIDAD               │
│     + code-review                       │
│     + code-quality-guardian             │
│     • Revisar calidad                   │
│     • Verificar estándares              │
│     • Seguridad básica                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  7. TESTING COMPLETO                    │
│     + playwright (E2E)                  │
│     • Tests de integración              │
│     • Tests end-to-end                  │
│     • Verificación realista             │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  8. OPTIMIZACIÓN                        │
│     + performance-optimization          │
│     • Profiling                         │
│     • Optimizar bottlenecks             │
│     • Validar métricas                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  9. SEGURIDAD                           │
│     + security-review                   │
│     + security-auditor                  │
│     • Auditoría de seguridad            │
│     • Escaneo de vulnerabilidades       │
│     • Corrección de issues              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  10. LOGGING & DEBUGGING                │
│      + logging-best-practices           │
│      + systematic-debugging             │
│      • Implementar logging robusto      │
│      • Verificar debuggability          │
│      • Tests de logging                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  11. DOCUMENTACIÓN                      │
│      (documentation-expert)             │
│      • Actualizar docs                  │
│      • Verificar calidad                │
│      • Ejemplos de uso                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  12. TRACKING & MEJORA CONTINUA         │
│      (overseer)                         │
│      • Seguimiento de progreso          │
│      • Revisión de calidad              │
│      • Iteración basada en feedback     │
└─────────────────────────────────────────┘

Leyenda:
  (skill) = Ya instalada
  + skill = Recomendada para instalar
```

---

## 💡 Tips de Uso

### Activación de Skills
Las skills se activan automáticamente cuando:
- Usas palabras clave relevantes (architecture, design, planning, tasks, TDD, etc.)
- Realizas acciones que caen en su dominio
- Las invocas explícitamente mencionando su nombre

### Combinación de Skills
Puedes combinar múltiples skills en un workflow:

**Ejemplo - Nuevo Feature:**
```bash
1. "Necesito planificar la implementación de autenticación OAuth"
   → Activa: project-planning

2. "Diseña la arquitectura del sistema de auth"
   → Activa: architecture-design

3. "Desglosa esto en tareas implementables"
   → Activa: task-breakdown

4. "Implementa la primera tarea usando TDD"
   → Activa: spec-driven-implementation

5. "Revisa y mejora la documentación de auth"
   → Activa: documentation-expert
```

---

## 🔍 Verificación de Skills Instaladas

Para ver qué skills tienes instaladas, revisa:
```
c:\Users\msole\.claude\skills\
```

Cada subdirectorio contiene un `SKILL.md` con la documentación completa.

---

## 📖 Referencias

- **Base Universal:** [universal-copilot-base.md](./universal-copilot-base.md)
- **Instrucciones del Proyecto:** [copilot-instructions.md](./copilot-instructions.md)
- **Directorio de Skills:** `c:\Users\msole\.claude\skills\`

---

## ✅ Checklist de Adopción

- [ ] Leído y comprendido los 10 Principios Universales
- [ ] Revisada documentación de las 6 skills principales instaladas
- [ ] Identificado qué skills son relevantes para mi proyecto actual
- [ ] Probado el workflow recomendado en una tarea real
- [ ] Integrado el checklist de calidad en mi proceso de desarrollo
- [ ] Considerado qué skills adicionales podrían ser útiles

---

*Esta guía está diseñada para ser agnóstica del stack tecnológico y adaptable a cualquier tipo de proyecto de software profesional.*
