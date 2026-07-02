# Ejemplos de Uso de la API

## Flujo completo de bootstrap

### Paso 1: Crear el primer admin

```bash
curl -X POST http://localhost:8000/api/v1/admin/init \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bebederos.com",
    "password": "AdminSecure123!",
    "nombre": "Juan Admin"
  }'
```

**Respuesta (201)**:
```json
{
  "email": "admin@bebederos.com",
  "nombre": "Juan Admin",
  "rol": "admin",
  "activo": true,
  "fecha_creacion": "2026-06-22T10:30:00"
}
```

### Paso 2: Login como admin

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bebederos.com",
    "password": "AdminSecure123!"
  }'
```

**Respuesta (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

Guardar el `access_token` como `$ADMIN_TOKEN` para requests posteriores.

### Paso 3: Ver dashboard del admin

```bash
curl -X GET http://localhost:8000/api/v1/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Respuesta (200)**:
```json
{
  "message": "Panel de administrador",
  "user": {
    "user_id": 1,
    "email": "admin@bebederos.com",
    "role": "admin",
    "nombre": "Juan Admin"
  }
}
```

### Paso 4: Ver resumen de métricas

```bash
curl -X GET http://localhost:8000/api/v1/admin/summary \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Respuesta (200)**:
```json
{
  "total_usuarios": 1,
  "total_usuarios_activos": 1,
  "total_usuarios_inactivos": 0,
  "total_admins": 1,
  "total_veterinarios": 0,
  "total_clientes": 0,
  "total_establecimientos": 0,
  "total_bebederos": 0,
  "total_bebederos_activos": 0,
  "total_monitoreos": 0,
  "total_imagenes": 0,
  "total_eventos": 0,
  "total_eventos_pendientes": 0
}
```

## Crear veterinarios

### Paso 5: Admin crea un veterinario

```bash
curl -X POST http://localhost:8000/api/v1/admin/veterinarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "vet1@bebederos.com",
    "password": "VetPass123!",
    "nombre": "Dr. Carlos López",
    "especialidad": "Rumiantes",
    "telefono": "+34-666-777-888",
    "ubicacion": "Madrid",
    "foto_perfil": "https://example.com/vet1.jpg",
    "activo": true
  }'
```

**Respuesta (201)**:
```json
{
  "usuario": {
    "email": "vet1@bebederos.com",
    "nombre": "Dr. Carlos López",
    "rol": "veterinario",
    "activo": true,
    "fecha_creacion": "2026-06-22T10:35:00"
  },
  "veterinario_id": 1,
  "especialidad": "Rumiantes",
  "telefono": "+34-666-777-888",
  "ubicacion": "Madrid",
  "foto_perfil": "https://example.com/vet1.jpg"
}
```

Guardar `veterinario_id` = 1 para crear clientes asignados a este veterinario.

## Crear clientes

### Paso 6: Admin crea un cliente asignado al veterinario

```bash
curl -X POST http://localhost:8000/api/v1/admin/clientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "granja@example.com",
    "password": "GranjaPass123!",
    "nombre": "Juan Granjero",
    "veterinario_id": 1,
    "razon_social": "Granja Pérez S.L.",
    "telefono": "+34-666-999-888",
    "contacto_principal": "Juan Pérez",
    "activo": true
  }'
```

**Respuesta (201)**:
```json
{
  "usuario": {
    "email": "granja@example.com",
    "nombre": "Juan Granjero",
    "rol": "cliente",
    "activo": true,
    "fecha_creacion": "2026-06-22T10:40:00"
  },
  "cliente_id": 1,
  "veterinario_id": 1,
  "razon_social": "Granja Pérez S.L.",
  "telefono": "+34-666-999-888",
  "contacto_principal": "Juan Pérez"
}
```

## Acceso como veterinario

### Paso 7: Veterinario hace login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vet1@bebederos.com",
    "password": "VetPass123!"
  }'
```

**Respuesta (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

Guardar el token como `$VET_TOKEN`.

### Paso 8: Veterinario ve su perfil

```bash
curl -X GET http://localhost:8000/api/v1/veterinarios/me \
  -H "Authorization: Bearer $VET_TOKEN"
```

**Respuesta (200)**:
```json
{
  "usuario": {
    "email": "vet1@bebederos.com",
    "nombre": "Dr. Carlos López",
    "rol": "veterinario",
    "activo": true,
    "fecha_creacion": "2026-06-22T10:35:00"
  },
  "veterinario_id": 1,
  "especialidad": "Rumiantes",
  "telefono": "+34-666-777-888",
  "ubicacion": "Madrid",
  "foto_perfil": "https://example.com/vet1.jpg"
}
```

### Paso 9: Veterinario ve sus clientes

```bash
curl -X GET http://localhost:8000/api/v1/veterinarios/clientes \
  -H "Authorization: Bearer $VET_TOKEN"
```

**Respuesta (200)**:
```json
{
  "clientes": [
    {
      "usuario": {
        "email": "granja@example.com",
        "nombre": "Juan Granjero",
        "rol": "cliente",
        "activo": true
      },
      "cliente_id": 1,
      "razon_social": "Granja Pérez S.L.",
      "telefono": "+34-666-999-888",
      "contacto_principal": "Juan Pérez"
    }
  ]
}
```

### Paso 10: Veterinario ve establecimientos de un cliente

```bash
curl -X GET http://localhost:8000/api/v1/veterinarios/1/clientes/1/establecimientos \
  -H "Authorization: Bearer $VET_TOKEN"
```

**Respuesta (200)**:
```json
{
  "establecimientos": []
}
```

(Vacío porque el cliente aún no ha creado establecimientos)

## Acceso como cliente

### Paso 11: Cliente hace login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "granja@example.com",
    "password": "GranjaPass123!"
  }'
```

**Respuesta (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

Guardar el token como `$CLIENT_TOKEN`.

### Paso 12: Cliente ve su perfil

```bash
curl -X GET http://localhost:8000/api/v1/clientes/me \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

**Respuesta (200)**:
```json
{
  "usuario": {
    "email": "granja@example.com",
    "nombre": "Juan Granjero",
    "rol": "cliente",
    "activo": true
  },
  "cliente_id": 1,
  "veterinario_id": 1,
  "razon_social": "Granja Pérez S.L.",
  "telefono": "+34-666-999-888",
  "contacto_principal": "Juan Pérez"
}
```

### Paso 13: Cliente ve sus establecimientos

```bash
curl -X GET http://localhost:8000/api/v1/clientes/mis-establecimientos \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

**Respuesta (200)**:
```json
{
  "establecimientos": []
}
```

## Error: Cliente intenta acceder a recurso ajeno

### Crear segundo cliente (sin asignación al vet)

```bash
curl -X POST http://localhost:8000/api/v1/admin/clientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "otra_granja@example.com",
    "password": "OtraPass123!",
    "nombre": "Otra Granja",
    "veterinario_id": 1,
    "razon_social": "Otra Granja S.L.",
    "telefono": "+34-666-111-222",
    "activo": true
  }'
```

Guardar `cliente_id` = 2.

### Cliente 1 intenta ver cliente 2

```bash
curl -X GET http://localhost:8000/api/v1/clientes/2 \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

**Respuesta (403)**:
```json
{
  "detail": "No tienes permiso para acceder a este recurso"
}
```

## Registro de nuevo cliente (sin admin)

### Cliente se auto-registra

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo_cliente@example.com",
    "password": "NewClientPass123!",
    "nombre": "Nuevo Cliente"
  }'
```

**Respuesta (201)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Nota**: El cliente se crea sin veterinario asignado. El admin debe crear un perfil de cliente completo con `POST /admin/clientes`.

## Scripts útiles

### Script bash para test completo

```bash
#!/bin/bash

BASE_URL="http://localhost:8000/api/v1"

# 1. Crear admin
echo "1. Creating admin..."
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/admin/init \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "AdminTest123!",
    "nombre": "Admin Test"
  }')

# 2. Login admin
echo "2. Logging in as admin..."
ADMIN_LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "AdminTest123!"
  }')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.access_token')
echo "Admin token: $ADMIN_TOKEN"

# 3. Create veterinarian
echo "3. Creating veterinarian..."
VET_RESPONSE=$(curl -s -X POST $BASE_URL/admin/veterinarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "vet@test.com",
    "password": "VetTest123!",
    "nombre": "Dr. Test",
    "especialidad": "Rumiantes",
    "activo": true
  }')

VET_ID=$(echo $VET_RESPONSE | jq -r '.veterinario_id')
echo "Veterinarian ID: $VET_ID"

# 4. Create client
echo "4. Creating client..."
CLIENT_RESPONSE=$(curl -s -X POST $BASE_URL/admin/clientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"email\": \"client@test.com\",
    \"password\": \"ClientTest123!\",
    \"nombre\": \"Test Client\",
    \"veterinario_id\": $VET_ID,
    \"razon_social\": \"Test Farm\",
    \"activo\": true
  }")

echo "Client created:"
echo $CLIENT_RESPONSE | jq '.'

echo "✓ Bootstrap complete!"
```

## Usar con Python requests

```python
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

# 1. Create admin
response = requests.post(
    f"{BASE_URL}/admin/init",
    json={
        "email": "admin@example.com",
        "password": "AdminSecure123!",
        "nombre": "Admin"
    }
)
print(f"Admin created: {response.status_code}")

# 2. Login
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "admin@example.com",
        "password": "AdminSecure123!"
    }
)
admin_token = response.json()["access_token"]
print(f"Token: {admin_token}")

# 3. Get summary
response = requests.get(
    f"{BASE_URL}/admin/summary",
    headers={"Authorization": f"Bearer {admin_token}"}
)
print(f"Summary: {response.json()}")
```

# Autenticación y Autorización

## Flujo de autenticación

### 1. Registro (crear cuenta cliente)

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "MiContraseña123",
  "nombre": "Juan Pérez"
}
```

**Respuesta (201)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Lo que sucede internamente**:
1. Se valida que el email sea único
2. Se valida que la contraseña tenga mínimo 8 caracteres
3. Se hashea la contraseña con bcrypt
4. Se crea un usuario con rol `cliente`
5. Se crea un perfil de cliente vinculado
6. Se genera un JWT con expiración de 30 minutos
7. Se retorna el token

### 2. Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "MiContraseña123"
}
```

**Respuesta (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Lo que sucede internamente**:
1. Se busca el usuario por email
2. Se valida que el usuario sea activo
3. Se compara la contraseña con el hash usando bcrypt
4. Se genera un nuevo JWT
5. Se actualiza `fecha_ultimo_acceso`

### 3. Usar token autenticado

Todos los endpoints protegidos requieren el header `Authorization`:

```bash
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Estructura del JWT

El token contiene los siguientes claims:

```json
{
  "sub": "1",           // user_id (como string)
  "email": "user@example.com",
  "role": "cliente",    // admin, veterinario, cliente
  "nombre": "Juan",
  "exp": 1626872345     // timestamp de expiración
}
```

## Control de Acceso por Rol

### Bootstrap: Crear el primer admin

```bash
POST /api/v1/admin/init
Content-Type: application/json

{
  "email": "admin@bebederos.com",
  "password": "SuperSecure123!",
  "nombre": "Administrador"
}
```

**Importante**: Este endpoint solo funciona si no existe ningún admin en la BD.

**Errores posibles**:
- `409 Conflict`: Ya existe un admin
- `409 Conflict`: Email duplicado
- `422 Unprocessable Entity`: Contraseña < 8 caracteres

### Admin: Crear veterinarios

Una vez con token de admin:

```bash
POST /api/v1/admin/veterinarios
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "email": "vet@example.com",
  "password": "VetPass123!",
  "nombre": "Dr. González",
  "especialidad": "Rumiantes",
  "telefono": "+34-666-777-888",
  "ubicacion": "Madrid",
  "activo": true
}
```

**Errores posibles**:
- `401 Unauthorized`: Token inválido o expirado
- `403 Forbidden`: Usuario no es admin
- `409 Conflict`: Email duplicado
- `422 Unprocessable Entity`: Datos inválidos

### Admin: Crear clientes

```bash
POST /api/v1/admin/clientes
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "email": "farm@example.com",
  "password": "FarmPass123!",
  "nombre": "Juan Granjero",
  "veterinario_id": 1,
  "razon_social": "Granja Pérez S.L.",
  "telefono": "+34-666-999-888",
  "contacto_principal": "Juan Pérez",
  "activo": true
}
```

**Validaciones**:
- El `veterinario_id` debe existir y ser activo
- El veterinario debe tener rol `veterinario`
- El email debe ser único

## Matrix de Control de Acceso

| Recurso | Admin | Veterinario | Cliente | No Autenticado |
|---------|-------|-------------|---------|-----------------|
| `/admin/*` | ✅ | ❌ | ❌ | ❌ |
| `/auth/register` | ✅ | ✅ | ✅ | ✅ |
| `/auth/login` | ✅ | ✅ | ✅ | ✅ |
| `/auth/me` | ✅ | ✅ | ✅ | ❌ |
| `/clientes/me` | ✅ (todos) | ✅ (sus asignados) | ✅ (solo él) | ❌ |
| `/veterinarios/me` | ✅ (todos) | ✅ (solo él) | ❌ | ❌ |
| `/establecimientos/{id}` | ✅ | ✅ (asignados) | ✅ (suyos) | ❌ |
| `/bebederos/{id}` | ✅ | ✅ (asignados) | ✅ (suyos) | ❌ |

## Seguridad

### Hashing de contraseñas

Las contraseñas se hashean usando **bcrypt** con salt:

```
Contraseña entrada: "MiContraseña123"
           ↓
    bcrypt.hash()
           ↓
Hash almacenado: "$2b$12$N9qo8uLOickgx2..."
```

Cuando el usuario intenta login:
```
Contraseña entrada: "MiContraseña123"
          +
Hash almacenado: "$2b$12$N9qo8uLOickgx2..."
          ↓
   bcrypt.verify()
          ↓
Resultado: True/False
```

### JWT Token

- **Algoritmo**: HS256 (HMAC-SHA256)
- **Clave secreta**: Definida en `JWT_SECRET_KEY` del `.env`
- **Expiración**: 30 minutos (configurable en `ACCESS_TOKEN_EXPIRE_MINUTES`)
- **Validación**: Se verifica firma y expiración en cada request

### Validaciones

1. **Email**:
   - Formato válido (validado por Pydantic `EmailStr`)
   - Único en el sistema

2. **Contraseña**:
   - Mínimo 8 caracteres
   - No hay validación de complejidad (recomendado agregar)

3. **Token**:
   - Debe estar en header `Authorization: Bearer <token>`
   - Debe ser válido (firma correcta)
   - No debe estar expirado

## Errores comunes

### Token expirado
```
Error: 401 Unauthorized
detail: "Token expirado"
```
**Solución**: Hacer login nuevamente para obtener un nuevo token

### Usuario no activo
```
Error: 401 Unauthorized
detail: "Usuario no activo"
```
**Solución**: El admin debe activar el usuario con `PATCH /admin/usuarios/{user_id}/estado`

### No es admin
```
Error: 403 Forbidden
detail: "Acceso denegado. Se requiere rol: admin"
```
**Solución**: Solo admins pueden acceder a endpoints de admin

### Email duplicado
```
Error: 409 Conflict
detail: "Ya existe un usuario con ese email"
```
**Solución**: Usar un email diferente

## Mejores prácticas

1. **Guardar token de forma segura**:
   - En aplicaciones web: localStorage o sessionStorage (con cuidado)
   - En aplicaciones móviles: Keychain (iOS) o KeyStore (Android)
   - Nunca en URLs o logs

2. **Renovar tokens**:
   - Los tokens expiran después de 30 minutos
   - Hacer login nuevamente cuando expire

3. **HTTPS**:
   - Usar HTTPS en producción
   - Tokens pueden ser interceptados en HTTP

4. **Secreto JWT**:
   - Cambiar `JWT_SECRET_KEY` en producción
   - No compartir ni versionar en git
   - Usar `.env` local

5. **Contraseñas de usuario**:
   - Recomendación: mínimo 12 caracteres
   - Recomendación: incluir mayúsculas, números, símbolos
   - Recomendación: educación a usuarios sobre contraseñas fuertes
# RBAC - Control de Acceso Basado en Roles

## Roles disponibles

### 1. Admin (`admin`)
- **Descripción**: Control total del sistema
- **Permisos**: 
  - Ver todos los usuarios, veterinarios, clientes
  - Crear veterinarios y clientes
  - Activar/desactivar usuarios
  - Ver métricas globales
  - Acceso a todos los recursos

**Endpoints exclusivos**:
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/summary`
- `POST /api/v1/admin/veterinarios`
- `POST /api/v1/admin/clientes`
- `PATCH /api/v1/admin/usuarios/{user_id}/estado`

### 2. Veterinario (`veterinario`)
- **Descripción**: Profesional de salud animal
- **Permisos**:
  - Ver sus clientes asignados
  - Ver establecimientos y bebederos de sus clientes
  - Ver monitoreos e imágenes
  - Acceso solo a datos de clientes asignados

**Endpoints disponibles**:
- `GET /api/v1/veterinarios/me` - Ver su perfil
- `GET /api/v1/veterinarios/{id}` - Ver otro veterinario (solo lectura)
- `GET /api/v1/veterinarios/clientes` - Ver sus clientes
- `GET /api/v1/clientes/{id}` - Ver clientes asignados
- `GET /api/v1/establecimientos/{id}` - Ver establecimientos de clientes asignados
- `GET /api/v1/bebederos/{id}` - Ver bebederos asignados

### 3. Cliente (`cliente`)
- **Descripción**: Propietario de establecimientos y bebederos
- **Permisos**:
  - Ver solo sus establecimientos
  - Ver solo sus bebederos
  - Ver monitoreos e imágenes de sus bebederos
  - No puede crear recursos

**Endpoints disponibles**:
- `GET /api/v1/clientes/me` - Ver su perfil
- `GET /api/v1/clientes/mis-establecimientos` - Ver sus establecimientos
- `GET /api/v1/establecimientos/{id}` - Ver detalles de establecimiento (si es suyo)
- `GET /api/v1/bebederos/{id}` - Ver detalles de bebedero (si es suyo)

## Jerarquía de acceso

```
Admin
 ├── Ve todo
 ├── Crea veterinarios
 └── Crea clientes

Veterinario (creado por admin)
 ├── Ve sus clientes asignados
 ├── Ve establecimientos de clientes
 └── Ve bebederos de clientes

Cliente (creado por admin, asignado a veterinario)
 ├── Ve sus establecimientos
 ├── Ve sus bebederos
 └── Ve monitoreos de sus bebederos
```

## Matriz de permisos detallada

### Auth (sin rol)
| Endpoint | GET | POST | PATCH | DELETE |
|----------|-----|------|-------|--------|
| `/auth/register` | - | ✅ | - | - |
| `/auth/login` | - | ✅ | - | - |
| `/auth/me` | ✅ | - | - | - |

### Admin
| Endpoint | GET | POST | PATCH | DELETE |
|----------|-----|------|-------|--------|
| `/admin/dashboard` | ✅ | - | - | - |
| `/admin/summary` | ✅ | - | - | - |
| `/admin/veterinarios` | - | ✅ | - | - |
| `/admin/clientes` | - | ✅ | - | - |
| `/admin/usuarios/{id}/estado` | - | - | ✅ | - |

### Clientes
| Endpoint | Requisito | Admin | Vet | Cliente |
|----------|-----------|-------|-----|---------|
| `/clientes/me` | Autenticado | ✅ | ❌ | ✅ |
| `/clientes/{id}` | Es suyo O admin | ✅ | ❌ | ✅ |
| `/clientes/mis-establecimientos` | Cliente autenticado | ✅ | ❌ | ✅ |

### Veterinarios
| Endpoint | Requisito | Admin | Vet | Cliente |
|----------|-----------|-------|-----|---------|
| `/veterinarios/me` | Vet autenticado | ✅ | ✅ | ❌ |
| `/veterinarios/{id}` | Es él O admin | ✅ | ✅ | ❌ |
| `/veterinarios/clientes` | Vet autenticado | ✅ | ✅ | ❌ |

### Establecimientos
| Endpoint | Requisito | Admin | Vet | Cliente |
|----------|-----------|-------|-----|---------|
| `/establecimientos/{id}` | Es suyo O asignado a vet | ✅ | ✅* | ✅ |
| `/establecimientos/{id}/bebederos` | Es suyo O asignado a vet | ✅ | ✅* | ✅ |

*Vet: Solo si el cliente está asignado a él

### Bebederos
| Endpoint | Requisito | Admin | Vet | Cliente |
|----------|-----------|-------|-----|---------|
| `/bebederos/{id}` | Es suyo O asignado a vet | ✅ | ✅* | ✅ |

*Vet: Solo si el bebedero pertenece a un cliente asignado

## Implementación técnica

### Dependency Injection

Todos los endpoints protegidos usan dependencias que validan el rol:

```python
from app.core.dependencies import require_admin, require_roles

# Solo admin
@router.post("/veterinarios")
def create_vet(
    payload: VeterinarioCreateRequest,
    db: Session = Depends(get_db),
    _: TokenPayload = Depends(require_admin),
):
    ...

# Admin o veterinario
@router.get("/clientes/{cliente_id}")
def get_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    user: TokenPayload = Depends(require_roles("admin", "veterinario")),
):
    ...
```

### Service Layer

La validación también se realiza en la capa de servicios:

```python
def get_cliente_detalle(db: Session, cliente_id: int, current_user: Usuario) -> ClienteResumen:
    cliente = db.get(Cliente, cliente_id)
    
    # Admin ve todos
    if current_user.rol == RoleName.admin:
        return ClienteResumen.model_validate(cliente)
    
    # Veterinario ve solo clientes asignados
    if current_user.rol == RoleName.veterinario:
        if cliente.veterinario_id != current_user.veterinario.id:
            raise HTTPException(403, "No tienes acceso")
    
    # Cliente ve solo a sí mismo
    if current_user.rol == RoleName.cliente:
        if cliente.usuario_id != current_user.id:
            raise HTTPException(403, "No tienes acceso")
    
    return ClienteResumen.model_validate(cliente)
```

## Patrones de seguridad

### 1. Defense in Depth
Validación en múltiples capas:
1. Router: `require_admin` / `require_roles`
2. Service: `_can_view_*` helpers
3. Database: Solo datos accesibles

### 2. Fail Secure
Si hay duda sobre acceso, se rechaza (403 Forbidden)

### 3. Zero Trust
Cada endpoint valida credenciales, incluso si viene de cliente confiable

## Escalarios comunes

### Veterinario no ve clientes asignados
**Síntoma**: Error 403 "No tienes acceso"
**Causa**: El cliente no está asignado al veterinario
**Solución**: Admin debe crear cliente con `veterinario_id` correcto

### Cliente ve datos de otro cliente
**Síntoma**: Está viendo establecimientos ajenos
**Causa**: Bug en service layer o acceso directo a BD
**Solución**: Verificar que `_can_view_cliente` se ejecuta en todas las rutas

### Admin no puede ver nada
**Síntoma**: Error 401 o 403
**Causa**: Token expirado o rol no es "admin"
**Solución**: Hacer login nuevamente, verificar JWT

## Testing RBAC

Para testear control de acceso:

```bash
# 1. Crear admin
POST /api/v1/admin/init

# 2. Login como admin
POST /api/v1/auth/login (admin credentials)

# 3. Crear veterinario
POST /api/v1/admin/veterinarios (with admin token)

# 4. Crear cliente
POST /api/v1/admin/clientes (with admin token)

# 5. Login como veterinario
POST /api/v1/auth/login (vet credentials)

# 6. Intentar crear cliente (debe fallar 403)
POST /api/v1/admin/clientes (with vet token)
→ Response: 403 Forbidden

# 7. Login como cliente
POST /api/v1/auth/login (cliente credentials)

# 8. Ver su establecimiento (debe funcionar)
GET /api/v1/establecimientos/{id} (with client token)
→ Response: 200 OK

# 9. Ver establecimiento de otro cliente (debe fallar 403)
GET /api/v1/establecimientos/{id_otro} (with client token)
→ Response: 403 Forbidden
```

## Próximas mejoras

- [ ] Permisos granulares (por acciones específicas)
- [ ] Roles personalizados
- [ ] Auditoría de accesos
- [ ] IP whitelisting
- [ ] 2FA (autenticación de dos factores)
# Bebederos API

Backend en FastAPI para administrar usuarios, veterinarios, clientes, establecimientos, bebederos y monitoreo.

## Stack

- FastAPI
- SQLAlchemy 2.x
- MySQL / MariaDB
- JWT con access token
- Passlib + bcrypt para hashing de contraseñas

## Estructura

- `app/core`: configuración, seguridad y dependencias.
- `app/db`: base ORM y sesión de base de datos.
- `app/models`: modelos SQLAlchemy del esquema.
- `app/schemas`: contratos Pydantic de entrada y salida.
- `app/crud`: acceso a datos.
- `app/services`: lógica de autenticación y negocio.
- `app/routers`: rutas API.

## Arranque

1. Crear un archivo `.env` con la URL de base de datos y el secreto JWT.
2. Instalar dependencias con `pip install -r requirements.txt`.
3. Ejecutar `uvicorn app.main:app --reload`.

## Endpoints disponibles

- `POST /api/v1/auth/register`: crea una cuenta de `cliente` y devuelve un JWT.
- `POST /api/v1/auth/login`: autentica y devuelve un JWT.
- `GET /api/v1/auth/me`: devuelve el usuario autenticado.
- `GET /api/v1/admin/summary`: resumen global con métricas de usuarios, recursos y eventos.
- `POST /api/v1/admin/veterinarios`: crea un usuario veterinario y su perfil.
- `POST /api/v1/admin/clientes`: crea un usuario cliente y lo asigna a un veterinario.
- `PATCH /api/v1/admin/usuarios/{user_id}/estado`: activa o desactiva un usuario.
- `GET /api/v1/clientes/me`: devuelve el detalle del cliente autenticado.
- `GET /api/v1/clientes/{cliente_id}`: devuelve el detalle de un cliente con sus establecimientos.
- `GET /api/v1/veterinarios/me`: devuelve el detalle del veterinario autenticado.
- `GET /api/v1/veterinarios/{veterinario_id}`: devuelve el detalle de un veterinario con sus clientes.
- `GET /api/v1/establecimientos/{establecimiento_id}`: devuelve el detalle del establecimiento y sus bebederos.
- `GET /api/v1/establecimientos/{establecimiento_id}/bebederos`: lista los bebederos de un establecimiento con control de acceso por rol.
- `GET /api/v1/bebederos/{bebedero_id}`: devuelve el detalle del bebedero con monitoreos e imágenes.

## Nota de diseño

La autorización está pensada por rol:

- `admin`: acceso total.
- `veterinario`: acceso a sus clientes y sus recursos.
- `cliente`: acceso solo a sus establecimientos y bebederos.

Eventos y monitoreo quedan en modo lectura para esta primera etapa.
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
python3 -m venv venv
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

## Endpoints disponibles

### Autenticación (sin rol requerido)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Registra una nueva cuenta de **cliente** |
| `POST` | `/api/v1/auth/login` | Login y recibe JWT |
| `GET` | `/api/v1/auth/me` | Obtiene datos del usuario autenticado |

### Admin (requiere rol `admin`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/admin/init` | **Crea el primer admin** (sin autenticación, solo funciona si no hay admins) |
| `GET` | `/api/v1/admin/dashboard` | Panel de administrador |
| `GET` | `/api/v1/admin/summary` | Resumen con 13 métricas operacionales |
| `POST` | `/api/v1/admin/veterinarios` | Crea usuario y perfil de veterinario |
| `POST` | `/api/v1/admin/clientes` | Crea usuario y cliente, lo asigna a un veterinario |
| `PATCH` | `/api/v1/admin/usuarios/{user_id}/estado` | Activa o desactiva un usuario |

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

## Imágenes

- Almacenamiento: la base de datos guarda metadatos de cada imagen en la tabla `imagenes` (campos principales: `id`, `monitoreo_id`, `bebedero_id`, `nombre_archivo`, `ruta_filesystem`, `fecha_captura`, `tamano_bytes`, `checksum`). El archivo binario se guarda en el filesystem del servidor, y `ruta_filesystem` contiene la ruta al archivo en disco.

- Endpoint para servir imágenes:
  - `GET /api/v1/imagenes/{imagen_id}` — Devuelve el archivo de imagen con `FileResponse`.
  - Requiere autenticación (`Authorization: Bearer <token>`).
  - Aplica las mismas reglas RBAC que para ver un bebedero: `admin` puede ver todo; `veterinario` y `cliente` solo pueden acceder a imágenes de sus recursos asignados.
  - Si el archivo no existe en disco, devuelve `404`.

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
python -m pytest tests/  # (cuando se agreguen tests)
```

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|------------|---------|
| `DATABASE_URL` | URL de conexión a MySQL | `mysql+pymysql://user:pass@localhost:3306/db` |
| `JWT_SECRET_KEY` | Clave secreta para firmar JWT | `tu-secreto-super-seguro` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token (opcional) | `30` |

## Próximas mejoras

- [ ] Alembic para versionado de schema
- [ ] Eventos detail endpoints (GET)
- [ ] Logging centralizado
- [ ] Rate limiting
- [ ] CORS configuración
- [ ] Backup y recovery
# El administrador es el rol con acceso total al sistema. Estas serían sus funciones principales:
Gestión de usuarios

Crear, editar y desactivar cuentas de veterinarios y clientes
Asignar qué veterinario supervisa a qué cliente
Resetear contraseñas y gestionar permisos

Gestión de dispositivos

Registrar nuevos bebederos en el sistema y asignarlos a un cliente
Ver el estado de conexión de todos los dispositivos (online / offline)
Configurar parámetros de los bebederos (umbrales de alerta, frecuencia de envío de datos, etc.)

Visibilidad total

Ver el dashboard de cualquier cliente o veterinario
Acceder al historial completo de datos de cualquier bebedero
Ver todas las alertas del sistema, no solo las de un cliente

Configuración del sistema

Definir los tipos de alertas y sus condiciones (ej: "nivel menor al 20% → alerta crítica")
Gestionar integraciones (si los datos llegan por MQTT, HTTP, etc.)

Reportes globales

Generar reportes de todo el sistema o filtrados por cliente, veterinario, región, etc.
Ver métricas generales: cuántos bebederos activos, cuántas alertas en el mes, etc.


En resumen, el admin es el único que puede crear y conectar las piezas del sistema. Los veterinarios y clientes solo ven datos, el admin configura todo.

# Veterinarios
Vista de supervisión general — el veterinario ve todos sus clientes en una lista, con un estado rápido de cada uno (todo bien / hay alertas). Desde ahí puede entrar al detalle de un cliente y ver sus bebederos.
Dashboard del veterinario → lista de sus clientes con estado general (verde / amarilla / roja)
Al entrar a un cliente → ve el resumen de todos los bebederos de ese cliente (igual que vería el cliente mismo)
Sección de alertas → historial de alertas de todos sus clientes en un solo lugar

# Clientes
Los clientes solo visualizan sus propios establecimientos y los bebederos contenidos en ellos. Un establecimiento agrupa uno o varios bebederos para facilitar la gestión cuando un cliente posee múltiples bebederos.

- Acceso: ver solo sus establecimientos (no puede ver establecimientos de otros clientes).
- Dentro de un establecimiento: ver la lista de bebederos, estado actual y datos de monitoreo (monitoreo diario, imágenes y eventos) en modo solo lectura.
- Relación con veterinarios: cada cliente tiene un único veterinario asignado (campo `veterinario_id` en la entidad `CLIENTES`); un veterinario puede supervisar varios clientes.
- Eventos: los clientes pueden ver el historial de eventos asociados a sus bebederos, pero no pueden editarlos ni resolverlos (solo visualización).

# Eventos y visibilidad
Todos los roles del sistema (admin, veterinario y cliente) pueden visualizar los eventos asociados a los bebederos. En esta etapa los eventos son de solo lectura para todos los roles; la capacidad de editar o resolver eventos se definirá posteriormente.

-- MySQL-compatible schema for Dosificador de Bebedero
-- Adjustments: AUTO_INCREMENT, TINYINT(1) for booleans, ENUM for role/gravity,
-- removed identifier with non-ascii

-- ============================================
-- 1. TABLA DE USUARIOS (Base para todos los roles)
-- ============================================
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol ENUM('admin','veterinario','cliente') NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_ultimo_acceso DATETIME NULL
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- ============================================
-- 2. TABLA DE VETERINARIOS
-- ============================================
CREATE TABLE veterinarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT UNIQUE NOT NULL,
    especialidad VARCHAR(255),
    telefono VARCHAR(20),
    ubicacion VARCHAR(255),
    foto_perfil VARCHAR(255),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_veterinarios_usuario ON veterinarios(usuario_id);

-- ============================================
-- 3. TABLA DE CLIENTES
-- ============================================
CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT UNIQUE NOT NULL,
    veterinario_id INT NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    contacto_principal VARCHAR(255),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (veterinario_id) REFERENCES veterinarios(id) ON DELETE RESTRICT
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_clientes_usuario ON clientes(usuario_id);
CREATE INDEX idx_clientes_veterinario ON clientes(veterinario_id);

-- ============================================
-- 4. TABLA DE ESTABLECIMIENTOS
-- ============================================
CREATE TABLE establecimientos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    ubicacion VARCHAR(255),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    UNIQUE(cliente_id, nombre)
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_establecimientos_cliente ON establecimientos(cliente_id);

-- ============================================
-- 5. TABLA DE RELACIONES VETERINARIO-CLIENTE
-- ============================================
-- La relación veterinario-cliente se maneja mediante la FK `clientes.veterinario_id`.
-- Tabla `veterinario_cliente` eliminada para evitar redundancia (1 cliente tiene 1 veterinario).

-- ============================================
-- 6. TABLA DE BEBEDEROS
-- ============================================
CREATE TABLE bebederos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    establecimiento_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    ubicacion VARCHAR(255),
    ip_address VARCHAR(45),
    puerto INT DEFAULT 8000,
    cobertura_objetivo FLOAT DEFAULT 80.0,
    estado TINYINT(1) DEFAULT 1,
    ultima_medicion DATETIME NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(establecimiento_id, nombre),
    FOREIGN KEY (establecimiento_id) REFERENCES establecimientos(id) ON DELETE CASCADE
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_bebederos_establecimiento ON bebederos(establecimiento_id);
CREATE INDEX idx_bebederos_estado ON bebederos(estado);

-- ============================================
-- 7. TABLA DE MONITOREO DIARIO
-- ============================================
CREATE TABLE monitoreo_diario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bebedero_id INT NOT NULL,
    fecha DATE NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    nivel_agua_cm FLOAT,
    distancia_sensor_cm FLOAT,
    cobertura_capsulas_porciento FLOAT,
    sensor_ultrasound TINYINT(1),
    camera_activa TINYINT(1),
    analyzer_activo TINYINT(1),
    config_ok TINYINT(1),
    error_message TEXT,
    UNIQUE(bebedero_id, fecha),
    FOREIGN KEY (bebedero_id) REFERENCES bebederos(id) ON DELETE CASCADE
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_monitoreo_bebedero_fecha ON monitoreo_diario(bebedero_id, fecha);

-- ============================================
-- 8. TABLA DE IMAGENES
-- ============================================
CREATE TABLE imagenes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    monitoreo_id INT NOT NULL,
    bebedero_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_filesystem VARCHAR(500) NOT NULL,
    fecha_captura DATETIME DEFAULT CURRENT_TIMESTAMP,
    tamano_bytes BIGINT,
    checksum VARCHAR(64),
    FOREIGN KEY (monitoreo_id) REFERENCES monitoreo_diario(id) ON DELETE CASCADE,
    FOREIGN KEY (bebedero_id) REFERENCES bebederos(id) ON DELETE CASCADE
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_imagenes_bebedero_fecha ON imagenes(bebedero_id, fecha_captura);

-- Si quieres evitar nombres duplicados por monitoreo:
-- CREATE UNIQUE INDEX uq_imagen_monitoreo_nombre ON imagenes(monitoreo_id, nombre_archivo);

-- ============================================
-- 9. TABLA DE EVENTOS
-- ============================================
CREATE TABLE eventos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bebedero_id INT NOT NULL,
    tipo_evento VARCHAR(100),
    descripcion TEXT,
    gravedad ENUM('info','warning','error','critical'),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    resuelta TINYINT(1) DEFAULT 0,
    fecha_resolucion DATETIME NULL,
    FOREIGN KEY (bebedero_id) REFERENCES bebederos(id) ON DELETE CASCADE
)
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_eventos_bebedero_sin_resolver ON eventos(bebedero_id, resuelta);
CREATE INDEX idx_eventos_gravedad ON eventos(gravedad, resuelta);

-- End of schema
