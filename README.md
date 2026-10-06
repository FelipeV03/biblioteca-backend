# Biblioteca — Backend

API REST del sistema de gestión de biblioteca: CRUD de libros, gestión de préstamos con reglas de negocio y estadísticas.

## Stack

- Node.js + Express + TypeScript
- MySQL + Sequelize (ORM, con migraciones versionadas)
- zod para validación de entrada
- Jest para pruebas unitarias
- Arquitectura en capas: `controllers` → `services` (lógica de negocio) → `repositories` (acceso a datos) → `models`

## Requisitos previos

- Node.js 20+
- MySQL corriendo localmente (o accesible por red)

## Instalación

```bash
npm install
```

Copia el archivo de variables de entorno de ejemplo y completa tus credenciales de MySQL:

```bash
cp .env.example .env
```

Crea la base de datos vacía (el nombre debe coincidir con `DB_NAME` en tu `.env`):

```sql
CREATE DATABASE biblioteca;
```

Corre las migraciones:

```bash
npm run migrate
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor en modo desarrollo (`http://localhost:4000`) con recarga automática |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm run start` | Corre el build compilado (`dist/server.js`) |
| `npm test` | Corre los tests unitarios (Jest) |
| `npm run migrate` | Aplica las migraciones pendientes |
| `npm run migrate:undo` | Revierte la última migración |
| `npm run seed` | Corre los seeders (si existen) |

## Estructura del proyecto

```
src/
├── config/        # Configuración (env, conexión a base de datos)
├── models/        # Modelos Sequelize (Book, User, Loan) y sus asociaciones
├── migrations/     # Migraciones de base de datos (orden: books → users → loans)
├── repositories/   # Acceso a datos, aísla Sequelize del resto de la app
├── services/       # Lógica de negocio (reglas de préstamos, validaciones)
├── controllers/     # Manejo de request/response
├── routes/          # Definición de endpoints
├── validators/       # Schemas de validación zod
├── middlewares/      # Validación genérica y manejo de errores centralizado
└── errors/            # Jerarquía de errores (404, 400, 409)
tests/unit/              # Tests unitarios por servicio
```

## API

Prefijo base: `/api/v1`

### Libros
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/books` | Listar (filtros: `genre`, `available`, `search`, `page`, `limit`) |
| GET | `/books/:id` | Detalle |
| POST | `/books` | Crear |
| PUT | `/books/:id` | Actualizar |
| DELETE | `/books/:id` | Eliminar (rechaza con 409 si tiene préstamos activos) |

### Usuarios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/users` | Listar |
| GET | `/users/:id` | Detalle |
| POST | `/users` | Crear |
| PUT | `/users/:id` | Actualizar |

### Préstamos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/loans` | Listar (filtros: `status` [active\|overdue\|returned], `userId`, `bookId`) |
| GET | `/loans/:id` | Detalle |
| POST | `/loans` | Registrar préstamo (`{ bookId, userId }`) |
| PATCH | `/loans/:id/return` | Marcar como devuelto |

**Reglas de negocio:** máximo 2 préstamos activos por usuario, plazo de devolución de 14 días, un libro no disponible no puede prestarse. El estado "vencido" se calcula al vuelo (no se persiste ni requiere un cron job).

### Estadísticas
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/stats/top-books?limit=5` | Libros más prestados |
| GET | `/stats/loans-summary` | Conteo de préstamos activos/vencidos/devueltos |
| GET | `/stats/availability-by-genre` | Disponibilidad por género |
| GET | `/stats/average-loan-duration` | Promedio de días de duración de los préstamos devueltos |

### Formato de respuesta

Éxito: `{ "data": ... }` (o `{ "data": [...], "meta": { "page", "limit", "total" } }` en listados paginados).

Error: `{ "error": { "message": "...", "code": "..." } }` — 400 (validación), 404 (no encontrado), 409 (regla de negocio, ej. `MAX_ACTIVE_LOANS`, `BOOK_NOT_AVAILABLE`), 500 (error interno).

## Tests

```bash
npm test
```

Los tests cubren la lógica de negocio en `services/` (reglas de préstamos, cálculo de estadísticas, validaciones de libros), mockeando los repositorios — no requieren una base de datos real.
