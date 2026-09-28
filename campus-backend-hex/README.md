# Campus Backend — Arquitectura Hexagonal (Puertos y Adaptadores)

Backend de la app de gestión académica, reestructurado con **arquitectura
hexagonal**: el mismo Node.js + Express + PostgreSQL de antes, pero con el
dominio (reglas de negocio) completamente aislado de la infraestructura
(HTTP, PostgreSQL). Funcionalmente es idéntico al backend anterior — mismos
endpoints, mismas respuestas — lo que cambia es cómo está organizado por dentro.

## ¿Por qué este cambio?

El backend anterior (en capas: `rutas → controladores → pg`) funcionaba,
pero mezclaba tres cosas en el mismo archivo: validar, decidir la regla de
negocio, y hablar con PostgreSQL. Esto es exactamente lo mismo que el
frontend Angular de este proyecto evita con su propia arquitectura
hexagonal (`dominio/puertos`, `dominio/casos-de-uso`,
`infraestructura/adaptadores-secundarios`) — así que el backend ahora usa
el mismo vocabulario y las mismas ideas.

## Estructura

```
src/
├── dominio/                                    ← NO conoce Express ni PostgreSQL
│   ├── errores/errores-dominio.js               (ErrorValidacion, ErrorNoEncontrado, ErrorCredencialesInvalidas, ErrorConflicto)
│   ├── puertos/                                 (interfaces que cualquier adaptador debe cumplir)
│   │   ├── repositorio.puerto.js                 (CRUD genérico: listar/obtenerPorId/crear/actualizar/eliminar)
│   │   ├── usuario-repositorio.puerto.js         (+ buscarPorCorreoYPassword)
│   │   ├── curso-repositorio.puerto.js
│   │   ├── calificacion-repositorio.puerto.js    (+ listarPorEstudianteConCurso)
│   │   ├── horario-repositorio.puerto.js         (+ listarPorEstudianteConCurso)
│   │   └── token-generador.puerto.js
│   └── casos-de-uso/
│       ├── gestionar-recurso.caso-uso.js         (CRUD genérico — lo usan usuarios, cursos, calificaciones, horario)
│       ├── auth/iniciar-sesion.caso-uso.js       (login: valida, genera token, nunca expone el password)
│       └── academico/
│           ├── consultar-calificaciones-estudiante.caso-uso.js  (calcula el PROMEDIO — regla de negocio real)
│           └── consultar-horario-estudiante.caso-uso.js
│
├── infraestructura/
│   ├── adaptadores-secundarios/                 ← implementan los puertos (el dominio los "consume")
│   │   ├── postgres/
│   │   │   ├── pool.js                           (conexión a PostgreSQL)
│   │   │   ├── case-mapper.util.js               (camelCase ↔ snake_case)
│   │   │   ├── repositorio-postgres.base.js      (CRUD genérico sobre cualquier tabla)
│   │   │   ├── usuario-repositorio.postgres.js
│   │   │   ├── curso-repositorio.postgres.js
│   │   │   ├── calificacion-repositorio.postgres.js  (el JOIN con cursos vive aquí, no en el caso de uso)
│   │   │   ├── horario-repositorio.postgres.js
│   │   │   └── migraciones/                      (schema.sql, init.js, seed.js, seed-data.json)
│   │   ├── token/token-generador.crypto.js       (token opaco — hoy con crypto, mañana JWT sin tocar el dominio)
│   │   └── memoria/usuario-repositorio.memoria.js  (para tests — ver tests/)
│   │
│   ├── adaptadores-primarios/http/               ← el mundo exterior entra por aquí
│   │   ├── controladores/                        (delgados: solo traducen req/res ↔ caso de uso)
│   │   ├── rutas/                                (routers de Express)
│   │   ├── middlewares/manejador-errores.middleware.js  (único lugar que traduce error de dominio → status HTTP)
│   │   └── servidor.js                           (arma la app de Express a partir de routers ya construidos)
│   │
│   └── contenedor.js                             ← COMPOSITION ROOT: el único archivo que conoce dominio + infraestructura a la vez
│
└── server.js                                     (arranca el servidor)

tests/                                             ← prueban el dominio SIN PostgreSQL (repositorio en memoria)
```

## La idea central

El dominio (`src/dominio/`) solo conoce **puertos** (interfaces). No
importa `express`, no importa `pg`, no sabe qué es un código de estado
HTTP. Por eso:

- El caso de uso de login se puede probar sin levantar PostgreSQL (`tests/iniciar-sesion.caso-uso.test.js`, usando `UsuarioRepositorioMemoria`).
- Cambiar de PostgreSQL a otro motor de base de datos significa escribir un nuevo adaptador en `infraestructura/adaptadores-secundarios/` — nada en `dominio/` cambia.
- Cambiar el token opaco por JWT firmado significa reemplazar `token-generador.crypto.js` por un `token-generador.jwt.js` — el caso de uso de login no se toca.
- Los errores de dominio (`ErrorNoEncontrado`, `ErrorValidacion`...) no saben qué es un 404 o un 400 — eso lo decide *solo* `manejador-errores.middleware.js`.

`src/infraestructura/contenedor.js` es la única excepción a propósito:
es el **composition root**, el lugar donde se decide "hoy usamos
PostgreSQL y crypto" y se conectan los cables. Si mañana se agrega un
modo de pruebas con adaptador en memoria para todo el backend (no solo
para el test de login), este es el único archivo que se modifica.

## 1. Instalación

```bash
cd campus-backend
npm install
```

## 2. Configuración

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de PostgreSQL (mismas variables que el
backend anterior: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `CORS_ORIGIN`).

```bash
createdb campus_db
```

## 3. Crear tablas y cargar datos

```bash
npm run db:init     # crea las tablas
npm run db:seed     # carga los mismos datos que ya tenías
```

## 4. Levantar el servidor

```bash
npm start        # producción
npm run dev       # con nodemon
```

`http://localhost:3000` — exactamente los mismos endpoints y formatos de
respuesta que el backend anterior.

## 5. Correr los tests del dominio (sin PostgreSQL)

```bash
npm test
```

Corre 6 tests sobre los casos de uso de login y de la vista académica del
estudiante, usando un repositorio en memoria — ninguno toca la red ni el
disco. Es la prueba concreta de que el dominio quedó realmente
desacoplado de la infraestructura.

## 6. Endpoints

Idénticos al backend anterior — no se requiere ningún cambio en el frontend.

| Método | Ruta | Nota |
|---|---|---|
| POST | `/login` | `{ correo, password }` → `{ token, usuario }` (sin password) |
| GET/POST/PUT/PATCH/DELETE | `/usuarios`, `/usuarios/:id` | filtrable por query string |
| GET/POST/PUT/PATCH/DELETE | `/cursos`, `/cursos/:id` | filtrable por query string |
| GET/POST/PUT/PATCH/DELETE | `/calificaciones`, `/calificaciones/:id` | filtrable (`?estudianteId=`, `?cursoId=`) |
| GET/POST/PUT/PATCH/DELETE | `/horario`, `/horario/:id` | filtrable (`?estudianteId=`, `?cursoId=`) |
| GET | `/api/estudiantes/:id/calificaciones` | `{ estudianteId, promedio, calificaciones: [...] }` |
| GET | `/api/estudiantes/:id/horario` | `{ estudianteId, horario: [...] }` |

## 7. Cómo agregar un recurso nuevo (ej. "inscripciones")

1. Puerto: `dominio/puertos/inscripcion-repositorio.puerto.js` (si necesita algo más que CRUD genérico).
2. Adaptador PostgreSQL: `infraestructura/adaptadores-secundarios/postgres/inscripcion-repositorio.postgres.js` extendiendo `RepositorioPostgresBase`.
3. En `contenedor.js`: instanciar el repositorio, envolverlo en `new GestionarRecursoCasoUso(repo, "inscripción")`, pasarlo a `crearControladorRecurso(...)`, montar con `crearRutasCrud(...)`.
4. Si tiene una regla de negocio propia (no solo CRUD), esc su propio caso de uso en `dominio/casos-de-uso/` en vez de usar el genérico.

## 8. Notas pendientes (igual que antes)

- **Password en texto plano** en el seed — para producción, hashear con `bcrypt` en el adaptador o en un caso de uso dedicado de registro.
- **Token opaco, no JWT firmado** — reemplazar `TokenGeneradorCrypto` por un adaptador JWT cuando se implemente verificación real.
- **Sin validación de esquema** (tipo Zod/Joi) todavía en los casos de uso — se puede añadir por recurso sin tocar la capa HTTP.
