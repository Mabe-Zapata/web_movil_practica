# Migración de PostgreSQL a Firebase Firestore

## Contexto del Proyecto

### Situación Inicial

- **Backend:** Node.js + Express
- **Arquitectura:** Hexagonal (Puertos y Adaptadores)
- **Base de datos original:** PostgreSQL
- **SDK instalado:** `firebase: ^12.19.0` (Web SDK - incompleto)

### Estructura del Proyecto (Arquitectura Hexagonal)

```
src/
├── dominio/                    # Reglas de negocio puras
│   ├── puertos/               # Interfaces (contratos)
│   │   ├── repositorio.puerto.js
│   │   ├── usuario-repositorio.puerto.js
│   │   ├── curso-repositorio.puerto.js
│   │   ├── horario-repositorio.puerto.js
│   │   └── calificacion-repositorio.puerto.js
│   ├── casos-de-uso/          # Lógica de negocio
│   │   ├── gestionar-recurso.caso-uso.js
│   │   └── auth/
│   └── errores/
│
├── infraestructura/            # Adaptadores (implementaciones)
│   ├── contenedor.js          # Composition Root
│   ├── firebase-admin.js     # ✅ NUEVO - Inicialización Firebase
│   └── adaptadores-secundarios/
│       ├── firestore/         # ✅ NUEVO - Repos Firestore
│       │   ├── repositorio-firestore.base.js
│       │   ├── usuario-repositorio.firestore.js
│       │   ├── curso-repositorio.firestore.js
│       │   ├── horario-repositorio.firestore.js
│       │   ├── calificacion-repositorio.firestore.js
│       │   └── migrar-a-firestore.js
│       ├── postgres/          # (ya no se usa)
│       └── token/
│       └── memoria/
│
└── adaptadores-primarios/     # Interface adapters (HTTP)
    └── http/
        ├── servidores.js
        ├── controladores/
        ├── rutas/
        └── middlewares/
```

---

## Paso 1: Análisis del Proyecto Existente

### Entidades del Sistema

| Entidad | Descripción | Campos |
|---------|-------------|--------|
| **usuarios** | Estudiantes, docentes, admins | id, nombre, iniciales, correo, password, rol, periodo |
| **cursos** | Materias disponibles | id, nombre, profesor, categoria |
| **calificaciones** | Notas de estudiantes | id, estudianteId, cursoId, nota |
| **horario** | Clases programadas | id, estudianteId, cursoId, dia, fecha, horaInicio, horaFin |

### Repositorios Existentes (PostgreSQL)

Cada repositorio implementaba su correspondiente **puerto** (interfaz):

```
RepositorioPuerto (genérico)
├── listar(filtros)
├── obtenerPorId(id)
├── crear(datos)
├── actualizar(id, datos)
└── eliminar(id)
        │
        ├── UsuarioRepositorioPuerto
        │   └── buscarPorCorreoYPassword(correo, password)
        ├── CursoRepositorioPuerto
        ├── HorarioRepositorioPuerto
        │   └── listarPorEstudianteConCurso(estudianteId)
        └── CalificacionRepositorioPuerto
            └── listarPorEstudianteConCurso(estudianteId)
```

---

## Paso 2: Instalación de Dependencias

### Paquetes Necesarios

```bash
npm install firebase-admin     # SDK de Firebase para backend Node.js
npm install google-auth-library # Para autenticación con Google APIs
npm uninstall pg              # Ya no se necesita PostgreSQL
```

### Archivos de Configuración Creados

**service-account.json** - Credenciales del service account de Firebase:
```json
{
  "type": "service_account",
  "project_id": "appmvpgestion-mbz",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-...@appmvpgestion-mbz.iam.gserviceaccount.com",
  "client_id": "..."
}
```

**NOTA:** El archivo `service-account.json` se genera desde Firebase Console:
1. Firebase Console → Project Settings → Service Accounts
2. "Generate new private key"
3. Descargar el JSON

---

## Paso 3: Creación de la Capa de Persistencia Firestore

### 3.1 Inicialización de Firebase Admin (`firebase-admin.js`)

```javascript
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("../../service-account.json");

initializeApp({
  credential: cert(serviceAccount),
});

const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

module.exports = { db };
```

**Propósito:**
- Inicializa Firebase Admin con las credenciales del service account
- Exporta `db` para ser usado en los repositorios
- Se importa antes que cualquier repositorio en el contenedor

---

### 3.2 Base Genérica de Repositorio Firestore

**Archivo:** `repositorio-firestore.base.js`

```javascript
class RepositorioFirestoreBase {
  constructor(coleccion) {
    this.coleccion = coleccion;
  }

  async listar(filtros = {}) {
    let query = db.collection(this.coleccion);
    
    for (const [key, value] of Object.entries(filtros)) {
      if (value !== undefined && value !== null) {
        query = query.where(key, "==", value);
      }
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async obtenerPorId(id) { /* ... */ }
  async crear(datos) { /* ... */ }
  async actualizar(id, datos) { /* ... */ }
  async eliminar(id) { /* ... */ }
}
```

**Características:**
- Provee CRUD genérico
- `listar(filtros)` permite filtrar por cualquier campo (equivalente a WHERE en SQL)
- Traduce documentos de Firestore a objetos JavaScript

---

### 3.3 Repositorios Concretos

**Estructura por cada entidad:**

```
┌─────────────────────────────────────┐
│      Puerto (Interfaz)             │
│  UsuarioRepositorioPuerto           │
└──────────────┬──────────────────────┘
               │ implements
               ▼
┌─────────────────────────────────────┐
│   Repositorio Firestore (Impl)      │
│  UsuarioRepositorioFirestore        │
│  - Extiende RepositorioFirestoreBase│
│  - nombre colección: "usuarios"     │
│  - Método extra: buscarPorCorreoY...│
└─────────────────────────────────────┘
```

**Repositorio de Usuarios:**
```javascript
class UsuarioRepositorioFirestore extends RepositorioFirestoreBase {
  constructor() {
    super("usuarios");
  }

  async buscarPorCorreoYPassword(correo, password) {
    const snapshot = await db
      .collection("usuarios")
      .where("correo", "==", correo)
      .where("password", "==", password)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
}
```

---

## Paso 4: Modificación del Contenedor (Composition Root)

### Antes (PostgreSQL)
```javascript
const { UsuarioRepositorioPostgres } = require("./postgres/usuario-repositorio.postgres");
const { pool } = require("./postgres/pool");

const usuarioRepositorio = new UsuarioRepositorioPostgres();
```

### Después (Firestore)
```javascript
// Firebase Admin se importa primero
require("./firebase-admin");

// Repositorios Firestore
const { UsuarioRepositorioFirestore } = require("./firestore/usuario-repositorio.firestore");

const usuarioRepositorio = new UsuarioRepositorioFirestore();
```

**Principio:** La arquitectura hexagonal permite cambiar la implementación de base de datos sin modificar el dominio. Solo se cambia el adaptador en el contenedor.

---

## Paso 5: Script de Migración de Datos

### Desafío
Los datos ya existían en PostgreSQL y necesitaban moverse a Firestore.

### Solución: Script de Migración

**Archivo:** `migrar-a-firestore.js`

```javascript
async function migrate() {
  // 1. Leer datos del JSON de seed
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  // 2. Migrar usuarios
  for (const u of data.usuarios) {
    await db.collection("usuarios").doc(String(u.id)).set({
      id: u.id,
      nombre: u.nombre,
      correo: u.correo,
      // ... todos los campos
    });
  }

  // 3. Migrar cursos (construir mapa para referencias)
  const cursosMap = {};
  for (const c of data.cursos) {
    await db.collection("cursos").doc(String(c.id)).set({...});
    cursosMap[c.id] = { nombre: c.nombre, profesor: c.profesor };
  }

  // 4. Migrar calificaciones (con datos desnormalizados del curso)
  for (const cal of data.calificaciones) {
    const curso = cursosMap[cal.cursoId] || {};
    await db.collection("calificaciones").doc(String(cal.id)).set({
      estudianteId: String(cal.estudianteId),
      cursoId: String(cal.cursoId),
      cursoNombre: curso.nombre || "",  // ✅ Desnormalizado
      cursoProfesor: curso.profesor || "",
      nota: parseFloat(cal.nota),
    });
  }

  // 5. Migrar horario (con datos desnormalizados del curso)
  // Mismo patrón...
}
```

### Desnormalización en Firestore

**Problema:** Firestore no tiene JOINs como SQL.

**Solución:** Guardar información del curso directamente en calificaciones y horario:

```
SQL (relacional):
calificaciones ───┬── cursos
                  │    (JOIN por curso_id)
horario      ─────┘

Firestore (documental):
calificaciones/
  { id, estudianteId, cursoId, cursoNombre, cursoProfesor, nota }
  
horario/
  { id, estudianteId, cursoId, cursoNombre, cursoProfesor, cursoCategoria }
```

### Ejecución de la Migración

```bash
npm run migrate:firestore
```

**Resultado:**
```
🚀 Iniciando migración (desde JSON) → Firestore...

📦 Migrando usuarios...
   ✅ 4 usuarios migrados
📦 Migrando cursos...
   ✅ 6 cursos migrados
📦 Migrando calificaciones...
   ✅ 6 calificaciones migradas
📦 Migrando horario...
   ✅ 3 horarios migrados

🎉 Migración completada exitosamente!
```

---

## Paso 6: Limpieza Final

### Scripts Eliminados del package.json

```diff
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
- "db:init": "node src/infraestructura/postgres/migraciones/init.js",
- "db:seed": "node src/infraestructura/postgres/migraciones/seed.js",
  "migrate:firestore": "node src/infraestructura/firestore/migrar-a-firestore.js",
  "test": "node --test tests/*.test.js"
}
```

### Paquetes Eliminados

```bash
npm uninstall pg  # Driver de PostgreSQL ya no necesario
```

### Dependencias Actuales

```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "firebase": "^12.19.0",
    "firebase-admin": "^14.4.0",
    "google-auth-library": "^11.1.0"
  }
}
```

---

## Estructura Final de Firestore

```
Firestore Database (appmvpgestion-mbz)
│
├── usuarios/          (4 documentos)
│   ├── 1 → { nombre: "Sofía Martinez", correo: "...", rol: "estudiante", ... }
│   ├── 2 → { nombre: "Matias Morales", correo: "...", rol: "docente", ... }
│   ├── 3 → { nombre: "Administrador Campus", ... }
│   └── 4 → { nombre: "Carlos Ramirez", ... }
│
├── cursos/            (6 documentos)
│   ├── 1 → { nombre: "Base de Datos", profesor: "Ing. Matias Morales", categoria: "APE" }
│   ├── 2 → { nombre: "Computación Visual", ... }
│   └── ...
│
├── calificaciones/    (6 documentos)
│   ├── 1 → { estudianteId: "1", cursoId: "1", cursoNombre: "Base de Datos", nota: 8.5 }
│   └── ...
│
└── horario/           (3 documentos)
    ├── 1 → { estudianteId: "1", cursoId: "1", cursoNombre: "Base de Datos", dia: "MAR", ... }
    └── ...
```

---

## Verificación del Sistema

### Iniciar el Servidor
```bash
npm run dev
```

**Respuesta:**
```
Servidor backend (arquitectura hexagonal) corriendo en http://localhost:3000
```

### Endpoints Disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /usuarios | Listar todos los usuarios |
| GET | /usuarios/:id | Obtener usuario por ID |
| POST | /usuarios | Crear usuario |
| PUT | /usuarios/:id | Actualizar usuario |
| DELETE | /usuarios/:id | Eliminar usuario |
| GET | /cursos | Listar cursos (mismo patrón CRUD) |
| GET | /calificaciones | Listar calificaciones |
| GET | /horario | Listar horarios |
| POST | /auth/login | Iniciar sesión |

---

## Comandos Utilizados (Resumen)

| Comando | Propósito |
|---------|-----------|
| `npm install firebase-admin` | Instalar SDK de Firebase Admin |
| `npm install google-auth-library` | Librería de autenticación Google |
| `npm uninstall pg` | Desinstalar driver PostgreSQL |
| `npm run migrate:firestore` | Migrar datos a Firestore |
| `npm run dev` | Iniciar servidor en desarrollo |

---

## Problemas Encontrados y Soluciones

### Problema 1: Service Account Inválido
- **Síntoma:** `Invalid JWT Signature`
- **Causa:** La clave privada estaba incompleta o corrupta en el archivo
- **Solución:** Descargar nuevo service account desde Firebase Console

### Problema 2: Errores de Autenticación Firebase
- **Síntoma:** `UNAUTHENTICATED: Request had invalid authentication credentials`
- **Causa:** Múltiples factores (versión de firebase-admin, configuración de credentials)
- **Solución:** Usar archivo JSON directo en lugar de variables de entorno

### Problema 3: PostgreSQL Apagado Durante Migración
- **Síntoma:** `ECONNREFUSED` al intentar conectar a PostgreSQL
- **Solución:** Modificar script de migración para leer directamente del JSON de seed

### Problema 4: Método `listar` No Existe en Firestore
- **Síntoma:** `this.repositorio.listar is not a function`
- **Causa:** Firestore tenía `obtenerTodos()`, no `listar(filtros)`
- **Solución:** Agregar método `listar(filtros)` a `RepositorioFirestoreBase`

### Problema 5: `db is not defined`
- **Síntoma:** Error de referencia en repositorio-firestore.base.js
- **Causa:** Faltaba importar `db` desde firebase-admin.js
- **Solución:** Agregar `const { db } = require("../../firebase-admin");`

---

## Conclusiones

### Beneficios de Firestore sobre PostgreSQL

| Aspecto | PostgreSQL | Firestore |
|---------|------------|-----------|
| **Esquema** | Fijo (SQL) | Flexible (NoSQL) |
| **JOINs** | Soportados | No soportados (desnormalizar) |
| **Escalabilidad** | Vertical | Horizontal automática |
| **Precio** | Servidor propio | Pay-per-use |
| **Sincronización** | No nativa | Tiempo real nativa |

### Mantenimiento de la Arquitectura Hexagonal

La migración fue posible gracias a la arquitectura hexagonal:

1. **Dominio sin dependencias** - Los casos de uso no saben si los datos vienen de PostgreSQL o Firestore
2. **Puertos como contratos** - Las interfaces definieron qué métodos debe tener cada repositorio
3. **Contenedor como único punto de cambio** - Solo se modificó el Composition Root para cambiar los adaptadores

### Próximos Pasos (Opcionales)

1. Habilitar **Firebase Auth** para autenticación real (no passwords en texto plano)
2. Implementar **Cloud Functions** para lógica serverless
3. Configurar **Cloud Storage** para manejo de archivos
4. Agregar **índices compuestos** en Firestore para consultas complejas

---

## Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MIGRACIÓN POSTGRESQL → FIRESTORE                 │
└─────────────────────────────────────────────────────────────────────┘

  INICIO
    │
    ▼
┌─────────────────────┐
│ 1. Instalar firebase-admin │
│    google-auth-library     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│ 2. Crear service-account.json │
│    (desde Firebase Console)     │
└──────────┬────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 3. Crear firebase-admin.js    │
│    - initializeApp(cert)       │
│    - getFirestore()            │
└──────────┬────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│ 4. Crear RepositorioFirestoreBase                    │
│    - listar(filtros)  ← CRUD genérico              │
│    - obtenerPorId(id)                               │
│    - crear(datos)                                   │
│    - actualizar(id, datos)                          │
│    - eliminar(id)                                   │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│ 5. Crear Repositorios Concretos                    │
│    - UsuarioRepositorioFirestore                    │
│    - CursoRepositorioFirestore                      │
│    - HorarioRepositorioFirestore                    │
│    - CalificacionRepositorioFirestore              │
│                                                      │
│    + Método buscarPorCorreoYPassword               │
│    + Método listarPorEstudianteConCurso            │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 6. Crear script de migración │
│    (migrar-a-firestore.js)   │
│    - Lee datos del JSON      │
│    - Inserta en Firestore    │
│    - Desnormaliza datos      │
└──────────┬────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 7. Actualizar contenedor.js │
│    - Importar firebase-admin │
│    - Usar repos Firestore    │
│    - Ya no usar PostgreSQL   │
└──────────┬────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 8. Ejecutar migración       │
│    npm run migrate:firestore │
└──────────┬────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 9. Desinstalar pg           │
│    npm uninstall pg          │
└──────────┬────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 10. Limpiar package.json     │
│     - Eliminar scripts pg    │
│     - Actualizar descrip.    │
└──────────┬────────────────────┘
           │
           ▼
       ✅ FIN
    (Backend conectado a Firestore)
```
