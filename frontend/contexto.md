# Bebederos API

Backend en FastAPI para administrar usuarios, veterinarios, clientes, establecimientos, bebederos y monitoreo.

**Estado**: ✅ Producción lista  
**Versión**: 1.0.0  
**Python**: 3.12+

## Stack

- **Framework**: FastAPI 0.137.2
- **ORM**: SQLAlchemy 2.0.41
- **Base de datos**: MySQL 8.0+ / MariaDB
- **Autenticación**: JWT con OAuth2
- **Hashing**: Passlib + bcrypt
- **Validación**: Pydantic 2.0+

## Estructura

- `app/core`: configuración, seguridad y dependencias.
- `app/db`: base ORM y sesión de base de datos.
- `app/models`: modelos SQLAlchemy del esquema.
- `app/schemas`: contratos Pydantic de entrada y salida.
- `app/crud`: acceso a datos.
- `app/services`: lógica de autenticación y negocio.
- `app/routers`: rutas API.

## Arranque rápido

### 1. Configuración inicial

```bash
# Clonar/descargar el proyecto
cd /home/matias/00\ pps

# Crear entorno virtual (si no existe)
python3 -m venv venv      # En Windows: python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configurar base de datos

Crear un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL=mysql+pymysql://bebederos:bebederos@localhost:3306/bebederos
JWT_SECRET_KEY=tu_secreto_super_seguro_aqui_cambiar_en_produccion
```

### 3. Inicializar la base de datos

```bash
# En MySQL/MariaDB:
CREATE USER 'bebederos'@'localhost' IDENTIFIED BY 'bebederos';
CREATE DATABASE bebederos;
GRANT ALL ON bebederos.* TO 'bebederos'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Arrancar el servidor

```bash
uvicorn app.main:app --reload
# La API estará disponible en http://localhost:8000
# OpenAPI: http://localhost:8000/docs
```

### 5. Crear el primer administrador

**Importante**: El endpoint de inicialización de admin se puede usar solo una vez, antes de crear ningún admin.

```bash
curl -X POST http://localhost:8000/api/v1/admin/init \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bebederos.com",
    "password": "SuperSecure123!",
    "nombre": "Administrador"
  }'
```

Respuesta exitosa (201):
```json
{
  "email": "admin@bebederos.com",
  "nombre": "Administrador",
  "rol": "admin",
  "activo": true,
  "fecha_creacion": "2026-06-22T10:30:00"
}
```

### 6. Login como admin

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bebederos.com",
    "password": "SuperSecure123!"
  }'
```

Guardar el `access_token` para hacer requests autenticados en los endpoints de admin.

### 7. Crear el veterinario por defecto (`id = 1`)

Sobre una base nueva, el primer veterinario debe crearse antes que cualquier otro para que MySQL le asigne el `id = 1`. Este veterinario se utilizará como referencia predeterminada al crear clientes.

```bash
curl -X POST http://localhost:8000/api/v1/admin/veterinarios \
  -H "Authorization: Bearer <access_token_admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "veterinario.default@bebederos.com",
    "password": "Veterinario123!",
    "nombre": "Veterinario por defecto",
    "especialidad": "bovino",
    "telefono": "0",
    "clave_fiscal": "236655581",
    "ubicacion": "campusUni",
    "activo": true
  }'
```

Verificar que la respuesta contenga `"veterinario_id": 1`. Al dar de alta un cliente, enviar `"veterinario_id": 1` para asignarlo a este veterinario. Si la tabla ya tuvo registros, el autoincremento podría no volver a comenzar en 1 aunque actualmente esté vacía.

## Endpoints disponibles

### Autenticación (sin rol requerido)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Autorregistro como **veterinario** o **cliente** (nunca admin) |
| `POST` | `/api/v1/auth/login` | Login y recibe JWT |
| `GET` | `/api/v1/auth/me` | Obtiene datos del usuario autenticado |

### Admin (requiere rol `admin`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/admin/init` | **Crea el primer admin** (sin autenticación, solo funciona si no hay admins) |
| `GET` | `/api/v1/admin/dashboard` | Panel de administrador |
| `GET` | `/api/v1/admin/summary` | Resumen con 13 métricas operacionales |
| `GET` | `/api/v1/admin/monitoreos` | Lista mediciones sin agrupar de múltiples bebederos, con rango de fechas opcional |
| `GET` | `/api/v1/admin/usuarios` | Lista todos los usuarios del sistema |
| `GET` | `/api/v1/admin/usuarios/{user_id}` | Obtiene el usuario y su perfil completo |
| `PATCH` | `/api/v1/admin/usuarios/{user_id}` | Actualiza datos comunes y campos compatibles del perfil, sin cambiar el rol |
| `GET` | `/api/v1/admin/veterinarios` | Lista todos los veterinarios |
| `GET` | `/api/v1/admin/clientes` | Lista todos los clientes |
| `PATCH` | `/api/v1/admin/clientes/{cliente_id}/veterinario` | Asigna o desasigna el veterinario de un cliente |
| `GET` | `/api/v1/admin/establecimientos` | Lista todos los establecimientos |
| `POST` | `/api/v1/admin/establecimientos` | Crea un establecimiento |
| `PATCH` | `/api/v1/admin/establecimientos/{establecimiento_id}` | Actualiza un establecimiento |
| `DELETE` | `/api/v1/admin/establecimientos/{establecimiento_id}` | Elimina un establecimiento |
| `GET` | `/api/v1/admin/bebederos` | Lista todos los bebederos |
| `POST` | `/api/v1/admin/bebederos` | Crea un bebedero |
| `PATCH` | `/api/v1/admin/bebederos/{bebedero_id}` | Actualiza un bebedero |
| `DELETE` | `/api/v1/admin/bebederos/{bebedero_id}` | Elimina un bebedero |
| `POST` | `/api/v1/admin/veterinarios` | Crea usuario y perfil de veterinario |
| `POST` | `/api/v1/admin/clientes` | Crea usuario y cliente, lo asigna a un veterinario |
| `POST` | `/api/v1/admin/administradores` | Crea otro usuario administrador |
| `PATCH` | `/api/v1/admin/usuarios/{user_id}/estado` | Activa o desactiva un usuario |

#### Consulta administrativa de monitoreos

```http
GET /api/v1/admin/monitoreos?bebedero_ids=1,2,3&desde=2026-07-12T00:00:00.000Z&hasta=2026-07-19T23:59:59.999Z
Authorization: Bearer <ADMIN_TOKEN>
```

Parámetros:

- `bebedero_ids`: obligatorio. IDs enteros positivos separados por comas.
- `desde`: fecha y hora ISO 8601 opcional, aplicada sobre `fecha_medicion`.
- `hasta`: fecha y hora ISO 8601 opcional, aplicada sobre `fecha_medicion`.

Para consultar todas las fechas disponibles de los bebederos seleccionados, se omiten `desde` y `hasta`:

```http
GET /api/v1/admin/monitoreos?bebedero_ids=1,2,3
```

Respuesta `200`:

```json
[
  {
    "id": 154,
    "bebedero_id": 2,
    "fecha": "2026-07-19",
    "fecha_medicion": "2026-07-19T15:30:00",
    "cobertura_capsulas_porcentaje": 72.5
  }
]
```

La respuesta contiene las mediciones individuales ordenadas por `fecha_medicion` ascendente; no calcula promedios, mínimos ni máximos. `fecha` conserva el tipo `date` del modelo, `fecha_medicion` expone el `timestamp` existente como datetime ISO 8601 sin conversión de zona horaria y la cobertura puede ser `null`. Si no existen mediciones para el filtro, devuelve `200` con `[]`. Si alguno de los bebederos solicitados no existe, devuelve `404` con los IDs faltantes.

### Clientes (requiere rol `cliente` o `admin`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/clientes/dashboard` | Panel del cliente |
| `GET` | `/api/v1/clientes/me` | Detalle del cliente autenticado |
| `GET` | `/api/v1/clientes/{cliente_id}` | Detalle de un cliente específico |
| `GET` | `/api/v1/clientes/mis-establecimientos` | Establecimientos del cliente autenticado |

### Veterinarios (requiere rol `veterinario` o `admin`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/veterinarios/dashboard` | Panel del veterinario |
| `GET` | `/api/v1/veterinarios/me` | Detalle del veterinario autenticado |
| `GET` | `/api/v1/veterinarios/{veterinario_id}` | Detalle de un veterinario específico |
| `GET` | `/api/v1/veterinarios/clientes` | Lista de clientes del veterinario |
| `GET` | `/api/v1/veterinarios/{veterinario_id}/clientes/{cliente_id}/establecimientos` | Establecimientos de un cliente |

### Establecimientos (requiere rol `veterinario`, `cliente` o `admin`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/establecimientos/{establecimiento_id}` | Detalle del establecimiento con bebederos |
| `GET` | `/api/v1/establecimientos/{establecimiento_id}/bebederos` | Lista de bebederos (con control de acceso) |

### Bebederos (requiere rol `veterinario`, `cliente` o `admin`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/bebederos/{bebedero_id}` | Detalle con monitoreos e imágenes ordenados por fecha |
| `POST` | `/api/v1/bebederos/{bebedero_id}/monitoreo` | Recibe datos del hardware con `X-API-Key` |
| `POST` | `/api/v1/bebederos/{bebedero_id}/imagenes` | Sube una imagen en base64 con `X-API-Key` |

### Hardware e ingesta

- Autenticación de hardware: cada bebedero usa una clave API derivada de `hardware_api_key_secret` y el `bebedero_id`.
- Monitoreo: si llega un payload para el mismo `bebedero_id` y la misma fecha, se actualiza el registro existente.
- Imágenes: se guardan en disco bajo `image_storage_dir` y se registran en la tabla `imagenes`.

## Imágenes

- Almacenamiento: la base de datos guarda metadatos de cada imagen en la tabla `imagenes` (campos principales: `id`, `monitoreo_id`, `bebedero_id`, `nombre_archivo`, `ruta_filesystem`, `fecha_captura`, `tamano_bytes`, `checksum`). El archivo binario se guarda en el filesystem del servidor, y `ruta_filesystem` contiene la ruta al archivo en disco.

- Endpoint para servir imágenes:
  - `GET /api/v1/imagenes/{imagen_id}` — Devuelve el archivo de imagen con `FileResponse`.
  - Requiere autenticación (`Authorization: Bearer <token>`).
  - Aplica las mismas reglas RBAC que para ver un bebedero: `admin` puede ver todo; `veterinario` y `cliente` solo pueden acceder a imágenes de sus recursos asignados.
  - Si el archivo no existe en disco, devuelve `404`.

- Endpoint para subir imágenes:
  - `POST /api/v1/bebederos/{bebedero_id}/imagenes` — Recibe `nombre_archivo` y `contenido_base64`.
  - Requiere `X-API-Key`.
  - Crea un monitoreo mínimo si el bebedero todavía no tiene uno.

- `image_url` en respuestas de API:
  - En el `GET /api/v1/bebederos/{bebedero_id}` cada `ImagenDetalle` incluye `image_url` con el path relativo `/api/v1/imagenes/{imagen_id}`. Esto permite al frontend construir la URL para obtener la imagen.

- Uso desde React:
  - Opción 1 (si el navegador puede incluir el header Authorization automáticamente, p. ej. cookie-based auth): usar `<img src={image_url} />`.
  - Opción 2 (recomendado con JWT Bearer): `img` no soporta headers, por eso usar `fetch` con el header y crear un blob URL:

```js
// ejemplo React
async function loadImage(token, imageUrl, imgElement) {
  const res = await fetch(imageUrl, { headers: { Authorization: 'Bearer ' + token } });
  if (!res.ok) throw new Error('Failed to load image');
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  imgElement.src = objectUrl;
}
```

  - Opción 3: generar URLs pre-signed / temporales desde el backend (recomendado si se quiere usar `<img>` directamente sin fetch). Esto implicaría exponer un endpoint que cree un token con expiración corta y devolver una URL pública firmada.

## Flujo de Bootstrap

```
1. POST /api/v1/admin/init
   ↓ (crea primer admin)
2. POST /api/v1/auth/login
   ↓ (obtiene JWT del admin)
3. POST /api/v1/admin/veterinarios
   ↓ (admin crea veterinarios)
4. POST /api/v1/admin/clientes
   ↓ (admin crea clientes y los asigna a veterinarios)
5. Clientes y veterinarios pueden usar sus endpoints respectivos
```

## Notas de diseño

### Autorización por rol

Todos los endpoints respetan control de acceso basado en rol:

- **`admin`**: acceso total a todos los recursos. Puede crear veterinarios, clientes, y ver cualquier dato.
- **`veterinario`**: acceso a sus clientes asignados y sus recursos (establecimientos, bebederos, monitoreos).
- **`cliente`**: acceso solo a sus propios establecimientos y bebederos.

### Seguridad

- **Contraseñas**: hasheadas con bcrypt (mínimo 8 caracteres).
- **Tokens**: JWT con expiración (30 minutos por defecto).
- **Email**: único en el sistema (no puede haber duplicados).
- **Bootstrap**: el endpoint `/admin/init` solo funciona si no existe ningún admin previo.
- **Hardware**: la clave API se deriva del identificador del bebedero y un secreto de entorno.

### Características

- **Eventos y Monitoreo**: disponibles en modo lectura (solo GET).
- **Eager Loading**: se usan selectinload para evitar N+1 queries.
- **OpenAPI**: documentación automática en `/docs`.
- **Validación**: Pydantic en todas las entradas.

## Respuestas de error

La API devuelve errores estándar HTTP:

| Código | Significado | Ejemplo |
|--------|------------|---------|
| `400` | Bad Request | Validación fallida |
| `401` | Unauthorized | Token inválido o expirado |
| `403` | Forbidden | Acceso denegado por rol |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Email duplicado, admin ya existe |
| `422` | Unprocessable Entity | Datos inválidos (ej: contraseña < 8 caracteres) |

## Testing

La suite de tests incluye:

- ✅ Validación de schemas (email, contraseña, roles)
- ✅ Generación y decodificación de JWT
- ✅ Hash bcrypt de contraseñas
- ✅ RBAC (Role-Based Access Control)
- ✅ Inicialización de admin
- ✅ Endpoints de registro y login

Ejecutar tests:
```bash
python -m pytest tests/
```

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|------------|---------|
| `DATABASE_URL` | URL de conexión a MySQL | `mysql+pymysql://user:pass@localhost:3306/db` |
| `JWT_SECRET_KEY` | Clave secreta para firmar JWT | `tu-secreto-super-seguro` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token (opcional) | `30` |
| `HARDWARE_API_KEY_SECRET` | Secreto para derivar la clave API del hardware | `mi-secreto-hardware` |
| `IMAGE_STORAGE_DIR` | Ruta base para guardar imágenes en disco | `storage/imagenes` |

## Próximas mejoras

- [ ] Alembic para versionado de schema
- [ ] Eventos detail endpoints (GET)
- [ ] Logging centralizado
- [ ] Rate limiting
- [ ] CORS configuración
- [ ] Backup y recovery
