# PPS Dosificador — Frontend

Aplicación web para administrar usuarios, establecimientos, bebederos y reportes de cobertura del sistema de dosificación. Incluye un panel administrativo de escritorio y recorridos adaptados para clientes y veterinarios.

**Estado**: en desarrollo activo  
**Frontend**: React 19 + TypeScript  
**Bundler**: Vite 8  
**API requerida**: Bebederos API (`/api/v1`)

## Stack

- **Framework**: React 19.
- **Lenguaje**: TypeScript 6.
- **Enrutamiento**: React Router 7.
- **Formularios**: React Hook Form.
- **Gráficos**: Recharts, Chart.js y React Chart.js 2.
- **Fechas**: date-fns.
- **Autenticación**: JWT decodificado con `jwt-decode`.
- **Notificaciones**: React Hot Toast.
- **Estilos**: CSS Modules y estilos globales.
- **Calidad**: ESLint con reglas para React Hooks.

## Funcionalidades

### Administrador

- Dashboard de escritorio con navegación por paneles.
- Listado, búsqueda, filtrado, creación y edición de usuarios.
- Activación y desactivación de cuentas.
- Asignación de veterinarios a clientes.
- Consulta y reasignación de clientes asociados a un veterinario.
- Administración de establecimientos.
- Administración de bebederos o dispositivos.
- Resumen de usuarios y dispositivos activos e inactivos.
- Reportes gráficos de cobertura por cliente, establecimiento o dispositivo.
- Visualización por barras o líneas.
- Comparación entre cobertura medida y cobertura objetivo.
- Selección de mediciones reales, promedio, mínimo y máximo.
- Filtros temporales de 7, 15, 30 días o todo el historial.

### Veterinario

- Consulta de clientes asociados.
- Selección de un cliente para ver sus establecimientos.
- Consulta de bebederos pertenecientes a esos establecimientos.
- Acceso protegido según el rol incluido en el JWT.

### Cliente

- Consulta de sus establecimientos.
- Consulta de los bebederos de cada establecimiento.
- Vista de resumen y detalle de sus dispositivos.
- Acceso protegido a sus propios recursos.

## Estructura

```text
src/
├── assets/                 Recursos gráficos e imágenes
├── components/
│   ├── Dashboard/          Paneles administrativos
│   │   ├── BebederosPanel/
│   │   ├── EstablecimientoPanel/
│   │   ├── ReportsPanel/
│   │   └── UsersPanel/
│   ├── Header/             Encabezados de escritorio y móvil
│   ├── LoginForm/          Formulario de autenticación
│   └── UserForm/           Alta de usuarios
├── context/                Estado global de autenticación
├── hooks/                  Hooks de interfaz y consulta de recursos
├── layouts/                Layouts públicos y privados
├── pages/
│   ├── LandingDesktop/     Login y dashboard administrativo
│   └── LandingMobile/      Flujo de clientes y veterinarios
├── types/                  Contratos TypeScript
├── utils/                  Cliente HTTP y tratamiento de errores
├── App.tsx                 Rutas principales
└── main.tsx                Punto de entrada
```

## Arranque rápido

### 1. Requisitos

- Node.js compatible con Vite 8.
- npm.
- Backend ejecutándose y accesible desde el navegador.

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar el backend

Crear o actualizar `.env.development`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PREFIX=/api/v1
```

La URL final se construye combinando ambas variables. Por ejemplo:

```text
http://localhost:8000/api/v1/auth/login
```

Después de modificar variables de entorno es necesario reiniciar Vite.

### 4. Iniciar el entorno de desarrollo

```bash
npm run dev
```

Vite mostrará en la terminal la URL local de la aplicación, normalmente `http://localhost:5173`.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia Vite en modo desarrollo |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |
| `npm run build` | Valida TypeScript y genera la aplicación de producción |
| `npm run preview` | Sirve localmente el contenido compilado |

Antes de integrar cambios se recomienda ejecutar:

```bash
npm run lint
npm run build
```

## Autenticación

El login utiliza:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña"
}
```

La respuesta debe contener:

```json
{
  "access_token": "jwt"
}
```

El frontend:

1. Guarda el token en `sessionStorage`, por lo que la sesión termina al cerrar el navegador.
2. Decodifica el JWT para obtener inicialmente el usuario y su rol.
3. Valida la sesión al iniciar mediante `GET /api/v1/auth/me`.
4. Agrega `Authorization: Bearer <token>` a las solicitudes protegidas.
5. Redirige al usuario según su rol.
6. Cierra la sesión si `/auth/me` rechaza el token o cualquier solicitud responde `401`.

> La decodificación del JWT en el navegador no reemplaza las validaciones de autorización del backend. La API debe validar el token y los permisos en cada endpoint.

## Rutas principales

### Públicas

| Ruta | Descripción |
|---|---|
| `/` | Selecciona la experiencia de escritorio o móvil |
| `/login` | Inicio de sesión móvil |
| `/home-desktop` | Inicio de sesión de escritorio |
| `/home-mobile` | Bienvenida móvil |
| `/nuevo-usuario` | Registro de una cuenta |
| `/home` | Redirección automática según el rol |

### Protegidas

| Ruta | Roles | Descripción |
|---|---|---|
| `/dashboard` | Admin | Dashboard administrativo |
| `/dashboard/dispositivos` | Admin | Panel de dispositivos |
| `/dashboard/dispositivos/nuevo` | Admin | Alta de dispositivos |
| `/veterinarios/clientes` | Autenticado | Clientes del veterinario |
| `/cliente/establecimientos` | Autenticado | Establecimientos disponibles |
| `/establecimiento/:id/bebederos` | Autenticado | Bebederos de un establecimiento |
| `/establecimiento/:id/resumen` | Autenticado | Resumen del establecimiento |

El componente `ProtectedRoute` controla el acceso en la interfaz. La autorización definitiva corresponde al backend.

## Integración con la API

El hook `useApi` centraliza las solicitudes HTTP:

- Construye la URL usando `VITE_API_BASE_URL` y `VITE_API_PREFIX`.
- Evita duplicar el prefijo `/api/v1`.
- Agrega automáticamente el token JWT.
- Configura `Content-Type: application/json`.
- Gestiona sesiones expiradas cuando recibe `401`.

### Endpoints administrativos utilizados

| Método | Endpoint | Uso |
|---|---|---|
| `GET` | `/api/v1/admin/summary` | Resumen general |
| `GET` | `/api/v1/admin/usuarios` | Listado de usuarios |
| `PATCH` | `/api/v1/admin/usuarios/{id}` | Edición de usuarios |
| `PATCH` | `/api/v1/admin/usuarios/{id}/estado` | Activación o desactivación |
| `GET` | `/api/v1/admin/clientes` | Clientes y relaciones |
| `GET` | `/api/v1/admin/veterinarios` | Veterinarios disponibles |
| `PATCH` | `/api/v1/admin/clientes/{id}/veterinario` | Asignación o reasignación |
| `GET/POST` | `/api/v1/admin/establecimientos` | Listado y alta |
| `PATCH/DELETE` | `/api/v1/admin/establecimientos/{id}` | Edición y eliminación |
| `GET/POST` | `/api/v1/admin/bebederos` | Listado y alta |
| `PATCH/DELETE` | `/api/v1/admin/bebederos/{id}` | Edición y eliminación |
| `GET` | `/api/v1/admin/monitoreos` | Mediciones para reportes |

## Reportes de cobertura

El panel de reportes permite buscar un cliente, establecimiento o dispositivo. Después de elegir un resultado muestra las relaciones en cascada y permite seleccionar múltiples dispositivos.

Las mediciones se consultan con:

```http
GET /api/v1/admin/monitoreos?bebedero_ids=1,2,3&desde=<ISO>&hasta=<ISO>
```

Para consultar todo el historial:

```http
GET /api/v1/admin/monitoreos?bebedero_ids=1,2,3
```

Contrato esperado:

```ts
interface MonitoreoAdmin {
  id: number;
  bebedero_id: number;
  fecha: string;
  fecha_medicion: string;
  cobertura_capsulas_porcentaje: number | null;
}
```

El frontend excluye valores `null` de los cálculos y genera las series de promedio, mínimo y máximo. La cobertura objetivo se obtiene desde `/api/v1/admin/bebederos`.

## Build de producción

Generar los archivos optimizados:

```bash
npm run build
```

El resultado se escribe en `dist/`. Para comprobarlo localmente:

```bash
npm run preview
```

Al desplegar en Nginx, Apache u otro servidor, debe configurarse un fallback hacia `index.html` para que las rutas de React Router funcionen al recargar la página.

Ejemplo conceptual para Nginx:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Solución de problemas

### La API no responde

- Verificar que el backend esté ejecutándose.
- Revisar `VITE_API_BASE_URL` y `VITE_API_PREFIX`.
- Confirmar la configuración CORS del backend.
- Reiniciar Vite después de cambiar el archivo de entorno.

### La sesión se cierra automáticamente

La API respondió `401`. Iniciar sesión nuevamente y verificar la vigencia y firma del JWT.

### Una ruta funciona navegando, pero falla al recargar

Configurar el fallback SPA del servidor hacia `index.html`.

### El gráfico no muestra datos

- Seleccionar al menos un dispositivo.
- Verificar el período elegido.
- Confirmar que `/api/v1/admin/monitoreos` devuelve mediciones para esos IDs.
- Las mediciones con `cobertura_capsulas_porcentaje: null` no se grafican.

## Estado de calidad

El proyecto debe mantenerse sin errores mediante:

```bash
npm run lint
npm run build
```

La compilación puede advertir sobre el tamaño del bundle principal. Es una advertencia de rendimiento y no impide generar la aplicación.
