# Campus Backend — Node.js + Express + PostgreSQL

Backend real para la app de gestión académica, pensado para reemplazar el mock de
`json-server` sin que el frontend tenga que cambiar nada: mismos recursos
(`/usuarios`, `/cursos`, `/calificaciones`, `/horario`), mismos nombres de campos
(camelCase) y mismo comportamiento de filtrado por query params.

## 1. Requisitos

- Node.js 18+
- PostgreSQL 14+ corriendo localmente (o accesible por red)

## 2. Instalación

```bash
cd campus-backend
npm install
```

## 3. Configuración

Copia el archivo de ejemplo y ajusta tus credenciales de PostgreSQL:

```bash
cp .env.example .env
```

Edita `.env`:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_db
DB_USER=postgres
DB_PASSWORD=tu_password
CORS_ORIGIN=*
```

Crea la base de datos vacía en PostgreSQL (una sola vez):

```bash
createdb campus_db
# o desde psql: CREATE DATABASE campus_db;
```

## 4. Crear tablas y cargar datos

```bash
npm run db:init    # crea las tablas (usuarios, cursos, calificaciones, horario)
npm run db:seed     # carga los mismos datos que tenías en db.json
```

`npm run db:seed` se puede correr las veces que quieras: limpia las tablas y
vuelve a insertar los datos originales.

## 5. Levantar el servidor

```bash
npm start        # producción
npm run dev       # con nodemon, recarga automática
```

El servidor queda en `http://localhost:3000`.

## 6. Endpoints (idénticos a los del mock, más login)

Todos los recursos soportan filtrado por query string, igual que json-server
(`?campo=valor&otroCampo=valor`).

### Login (nuevo)
| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| POST | `/login` | `{ "correo": "estudiante@uta.edu.ec", "password": "campus2026" }` | `200` con el usuario (sin password) si coincide, `401` si no |

También acepta `usuario` o `email` como alias de `correo`, y `contrasena`/`clave`
como alias de `password`, por si el formulario del frontend usa otro nombre
de campo.

Ejemplo con curl:
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"estudiante@uta.edu.ec","password":"campus2026"}'
```

Respuesta exitosa:
```json
{
  "token": "1.9f2a3e7b1c4d5f6a7b8c9d0e1f2a3b4c",
  "usuario": {
    "id": 1,
    "nombre": "Sofía Martinez",
    "iniciales": "SM",
    "correo": "estudiante@uta.edu.ec",
    "rol": "estudiante",
    "periodo": "Periodo 2026 · Portal estudiantil"
  }
}
```

> El `token` por ahora es un valor opaco generado con `crypto.randomBytes`
> (no es un JWT firmado ni verificable en el servidor). Es un placeholder
> para que el frontend tenga algo que guardar y enviar como
> `Authorization`, hasta que se implemente JWT real.

### Vista académica del estudiante (nuevo)
| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/api/estudiantes/:id/calificaciones` | `{ estudianteId, promedio, calificaciones: [{ curso, profesor, nota }] }` |
| GET | `/api/estudiantes/:id/horario` | `{ estudianteId, horario: [{ dia, fecha, horaInicio, horaFin, curso, profesor, categoria }] }` |

Estos dos endpoints hacen el JOIN con `cursos` en el servidor, exactamente
como lo esperaba el frontend (`AcademicoLecturaHttp` / `academico.service.ts`).
Si el estudiante no tiene registros, devuelven arrays vacíos y `promedio: 0`
(no un 404).

### Usuarios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/usuarios` | Lista todos. Ej: `/usuarios?correo=estudiante@uta.edu.ec&password=campus2026` (login) |
| GET | `/usuarios/:id` | Uno por id |
| POST | `/usuarios` | Crear |
| PUT / PATCH | `/usuarios/:id` | Actualizar |
| DELETE | `/usuarios/:id` | Eliminar |

### Cursos
| Método | Ruta |
|---|---|
| GET | `/cursos` (filtros: `?categoria=`, `?profesor=`) |
| GET | `/cursos/:id` |
| POST | `/cursos` |
| PUT / PATCH | `/cursos/:id` |
| DELETE | `/cursos/:id` |

### Calificaciones
| Método | Ruta |
|---|---|
| GET | `/calificaciones` (filtros: `?estudianteId=`, `?cursoId=`) |
| GET | `/calificaciones/:id` |
| POST | `/calificaciones` |
| PUT / PATCH | `/calificaciones/:id` |
| DELETE | `/calificaciones/:id` |

### Horario
| Método | Ruta |
|---|---|
| GET | `/horario` (filtros: `?estudianteId=`, `?cursoId=`, `?dia=`) |
| GET | `/horario/:id` |
| POST | `/horario` |
| PUT / PATCH | `/horario/:id` |
| DELETE | `/horario/:id` |

## 7. Cómo apuntar el frontend aquí

En el frontend, cambia la URL base que usabas para json-server
(algo como `http://localhost:3001`) por la de este backend:

```
http://localhost:3000
```

Los paths, verbos HTTP y forma del JSON de respuesta son los mismos, así que
no debería requerirse ningún otro cambio en los servicios/fetch del frontend.

## 8. Notas y siguientes pasos sugeridos

- **Password en texto plano:** los datos de seed traen contraseñas en texto
  plano tal como estaban en el `db.json` original. Para producción se
  recomienda hashear con `bcrypt` y no exponer el campo `password` en las
  respuestas de `/usuarios`.
- **Autenticación:** por ahora no hay JWT (se decidió dejarlo para una
  siguiente etapa). Hay un endpoint `POST /login` que valida correo y
  password y devuelve el usuario sin la contraseña. Al no haber JWT, el
  frontend debe seguir guardando el usuario devuelto (ej. en localStorage
  o estado global) para mantener la sesión, tal como lo hacía con el mock.
- **Validación de datos:** no hay validación de esquema (tipo Joi/Zod) en
  el body todavía; se puede añadir por recurso si se necesita.
