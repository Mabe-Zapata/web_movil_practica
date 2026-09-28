# Campus — MVP Gestión Académica (con CRUD de administración)

Frontend Angular 21 + Tailwind CSS v4, conectado a un mock API con
json-server. Incluye la vista de estudiante (solo lectura) y una capa de
administración con CRUD completo para docentes/administradores.

## Estructura

```
.
├── mock-api/              ← json-server 0.17.4 + rutas personalizadas
│   ├── db.json             (usuarios, cursos, calificaciones, horario)
│   ├── server.js
│   └── package.json
└── frontend-academico/    ← Angular 21.2 + Tailwind CSS v4
    ├── src/app/
    │   ├── core/
    │   │   ├── models/          (incluye los *Record y *FormValue del CRUD)
    │   │   ├── services/        (lectura + 4 servicios *AdminService)
    │   │   ├── guards/          (authGuard, roleGuard, adminOnlyGuard)
    │   │   └── interceptors/
    │   ├── features/
    │   │   ├── login/
    │   │   ├── resumen/
    │   │   ├── notas/            ← lectura (estudiante) O gestión CRUD (docente/admin)
    │   │   ├── horario/          ← lectura (estudiante) O gestión CRUD (docente/admin)
    │   │   └── admin/
    │   │       ├── cursos/       ← CRUD completo
    │   │       └── usuarios/     ← CRUD completo (solo admin)
    │   └── shared/
    │       ├── layout/           (sidebar + topbar, con sección "Administración")
    │       └── ui/modal.component.*  (modal reutilizable para los 4 formularios)
    ├── .postcssrc.json
    └── package.json
```

## 1. Levantar el mock API

```bash
cd mock-api
npm install
npm start
```

Queda escuchando en `http://localhost:3001`.

### Rutas personalizadas (join manual para la vista de estudiante)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/login` | `{ correo, password }` → `{ token, usuario }` |
| GET | `/api/estudiantes/:id/calificaciones` | Notas con promedio ya calculado |
| GET | `/api/estudiantes/:id/horario` | Horario con curso/profesor/categoría ya combinados |

### Rutas CRUD estándar (usadas por los formularios de administración)

| Método | Ruta |
|---|---|
| GET, POST | `/usuarios`, `/cursos`, `/calificaciones`, `/horario` |
| GET, PUT, DELETE | `/usuarios/:id`, `/cursos/:id`, `/calificaciones/:id`, `/horario/:id` |

Estas son 100% el router REST estándar de json-server — no requirieron
código adicional en `server.js`.

### Usuarios de prueba (los 3 roles)

| Rol | Correo | Contraseña |
|---|---|---|
| Estudiante | `estudiante@uta.edu.ec` | `campus2026` |
| Docente | `docente@uta.edu.ec` | `campus2026` |
| Admin | `admin@uta.edu.ec` | `campus2026` |

> ⚠️ Mock solo para desarrollo: contraseñas en texto plano, token sin firmar.
> No desplegar en producción.

## 2. Levantar el frontend

En otra terminal:

```bash
cd frontend-academico
npm install
npm start
```

Abre `http://localhost:4200`.

## 3. Qué ver según el rol con el que inicies sesión

- **Estudiante** → ve Resumen, Mis Notas y Horario en modo **solo lectura**
  (exactamente como en los mockups originales). No ve la sección
  "Administración" en absoluto.
- **Docente** → ve lo mismo, pero **Mis Notas** y **Horario** cambian a una
  vista de **gestión** (tabla + botones Agregar/Editar/Eliminar). Además
  aparece "Administración → Cursos" en el sidebar.
- **Admin** → todo lo del docente, más "Administración → Usuarios" para
  gestionar cuentas (crear, cambiar rol, resetear contraseña, eliminar).

Esta es la razón de que **Notas** y **Horario** no sean dos pantallas
separadas para lectura/edición: la misma ruta decide qué mostrar según
`auth.puedeGestionar()`, evitando duplicar la navegación.

## 4. Patrón de los formularios CRUD

Los 4 formularios (Curso, Usuario, Calificación, Horario) siguen el mismo
patrón, ilustrado en `features/admin/cursos/cursos-admin.component.ts`:

1. Un `FormGroup` (Reactive Forms) con validadores.
2. `abrirCrear()` / `abrirEditar(registro)` resetean el formulario y abren
   `<app-modal>`.
3. `guardar()` llama a `crear()` o `actualizar()` del servicio `*AdminService`
   correspondiente según si `editando()` tiene un valor.
4. El servicio hace la petición HTTP y llama `.reload()` sobre su
   `httpResource`, así la tabla se refresca sola sin código adicional en el
   componente.
5. `eliminar(registro)` pide confirmación con `confirm()` nativo (suficiente
   para este MVP) y llama a `eliminar()` del servicio.

## 5. Diseño visual

Los tokens de color (`src/styles.css`, bloque `@theme`) siguen la paleta del
mockup original: verde azulado oscuro (`brand-900` `#0f4c46`) y dorado
(`accent-500` `#e3a34d`). Las pantallas de administración reutilizan los
mismos tokens para que no se sientan como una sección "aparte" del producto.

## 6. Próximos pasos sugeridos

- Sustituir `confirm()` nativo por un diálogo de confirmación propio si el
  proyecto necesita un estilo visual más consistente.
- Cuando exista el backend real, cambiar `API_URL` en
  `core/config/api.config.ts` — las rutas REST que usan los `*AdminService`
  deberían mapear 1:1 a endpoints equivalentes en Express.
- Agregar paginación a las tablas de administración si el volumen de datos
  crece más allá de una pantalla.
