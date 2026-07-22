# PPS Dosificador — Frontend

Aplicación web para administrar usuarios, establecimientos, bebederos y reportes de cobertura del sistema de dosificación. Incluye un panel administrativo de escritorio y recorridos adaptados para clientes y veterinarios.

**Estado**: en desarrollo activo  
**Frontend**: React 19 + TypeScript  
**Bundler**: Vite 8  
**API requerida**: Bebederos API (`/api/v1`)

## Documentación

- [Flujo real de navegación](./FLUJO_NAVEGACION.md): rutas, redirecciones, permisos, recorridos por rol y diagramas Mermaid.

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
- Contacto con soporte técnico mediante un mensaje prearmado de WhatsApp.
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
│   ├── SupportWhatsAppModal/ Formulario de contacto con soporte
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
VITE_SUPPORT_WHATSAPP_NUMBER=549CODIGOAREANUMERO
```

La URL final se construye combinando ambas variables. Por ejemplo:

```text
http://localhost:8000/api/v1/auth/login
```

Después de modificar variables de entorno es necesario reiniciar Vite.

`VITE_SUPPORT_WHATSAPP_NUMBER` debe contener el código de país, código de área y número de soporte, únicamente con dígitos. No debe incluir `+`, espacios ni guiones. En Argentina se utiliza el prefijo `549`, sin el `0` del código de área ni el `15` del número móvil.

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

## Simulador de hardware

Durante el desarrollo, el panel administrativo **Dispositivos** muestra la acciÃ³n **Simular lectura**. Esta herramienta reproduce temporalmente el comportamiento del dispositivo fÃ­sico y solo se renderiza cuando `import.meta.env.DEV` es verdadero.

Cada ejecuciÃ³n realiza el flujo real de ingesta de forma secuencial:

```text
POST /api/v1/bebederos/{bebedero_id}/monitoreo
    â†“ respuesta exitosa
POST /api/v1/bebederos/{bebedero_id}/imagenes
```

La imagen nunca se envÃ­a si falla la creaciÃ³n del monitoreo. El backend la asocia al monitoreo mÃ¡s reciente del bebedero, por lo que no deben ejecutarse ambas solicitudes en paralelo.

### Generar la API key del dispositivo

Los endpoints de ingesta no usan el JWT del administrador. Requieren la cabecera:

```http
X-API-Key: <clave-del-dispositivo>
```

La clave se genera desde la raÃ­z del backend mediante su CLI. Para el bebedero `25`:

```powershell
.\venv\Scripts\python.exe -m app.cli.device_api_key 25
```

Ejecutar esa instrucciÃ³n en una terminal PowerShell ubicada en la carpeta raÃ­z del backend. El comando imprime Ãºnicamente la `X-API-Key`; copiar su salida y pegarla en el campo **API key del dispositivo** del simulador. El nÃºmero final es el `bebedero_id` y debe reemplazarse por el ID seleccionado en el formulario.

El ID utilizado en el comando debe coincidir exactamente con el dispositivo seleccionado en el simulador. Para otro bebedero se debe generar su propia clave:

```powershell
.\venv\Scripts\python.exe -m app.cli.device_api_key 26
```

La API key:

- Es determinÃ­stica para la combinaciÃ³n `bebedero_id + HARDWARE_API_KEY_SECRET`.
- Se reutiliza para todas las mediciones e imÃ¡genes del mismo bebedero.
- No cambia entre lecturas ni por utilizar otra fecha u horario.
- No sirve para un bebedero con otro ID.
- Debe regenerarse si cambia `HARDWARE_API_KEY_SECRET` en el backend.
- No debe almacenarse en el frontend, `localStorage` ni variables `VITE_*`.

El simulador mantiene la clave solamente en memoria y la limpia después de completar el flujo. Un `401` de estos endpoints se interpreta como una API key invÃ¡lida y no cierra la sesiÃ³n administrativa.

### Datos simulados

El formulario permite enviar el contrato completo de monitoreo:

```json
{
  "fecha": "2026-07-20",
  "timestamp": "2026-07-20T14:30:00.000Z",
  "nivel_agua_cm": 12.5,
  "distancia_sensor_cm": 7.2,
  "cobertura_capsulas_porciento": 72.5,
  "sensor_ultrasound": true,
  "camera_activa": true,
  "analyzer_activo": true,
  "config_ok": true,
  "error_message": null
}
```

La cobertura se valida en la interfaz entre `0` y `100`. Los valores numÃ©ricos opcionales vacÃ­os y el mensaje de error vacÃ­o se envÃ­an como `null`.

La imagen se convierte a Base64 y se envÃ­a con un nombre Ãºnico. Para las pruebas se aceptan JPEG, PNG y WebP de hasta 5 MB. La operaciÃ³n crea registros reales en el backend configurado.

### Probar otra lectura del mismo bebedero

Para subir otra imagen con un horario diferente:

1. Seleccionar nuevamente el mismo bebedero.
2. Usar la misma API key.
3. Indicar la nueva fecha y hora y los valores de la mediciÃ³n.
4. Seleccionar la nueva imagen.
5. Ejecutar **Enviar lectura e imagen**.

El simulador crea primero un monitoreo nuevo y luego carga su imagen. No se debe subir solamente la imagen si se pretende representar una lectura nueva, porque quedarÃ­a asociada al monitoreo mÃ¡s reciente existente.

### VerificaciÃ³n en la interfaz mobile

DespuÃ©s de completar la simulaciÃ³n, iniciar sesiÃ³n como el cliente propietario o su veterinario, ingresar al establecimiento y abrir el bebedero. `BebederoCard` descarga la imagen protegida con JWT, la muestra completa y permite ampliarla al tocarla.

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

## Soporte técnico por WhatsApp

En la navegación inferior de la versión móvil, la opción **Soporte Técnico** abre un formulario dentro de la aplicación. El usuario debe:

1. Seleccionar el tipo de problema.
2. Escribir una descripción de hasta 600 caracteres.
3. Pulsar **Continuar en WhatsApp**.

El frontend genera un enlace `https://wa.me/` y abre WhatsApp con un mensaje que incluye:

- Tipo de problema y descripción.
- Nombre y correo del usuario autenticado.
- Rol del usuario.
- Fecha y hora de la consulta.

Este flujo no requiere cambios en el backend ni almacena tickets o conversaciones. El envío del mensaje queda bajo confirmación del usuario dentro de WhatsApp.

El botón para continuar permanece deshabilitado cuando la descripción está vacía o cuando `VITE_SUPPORT_WHATSAPP_NUMBER` no está configurado. Si se modifica el número, se debe detener y volver a iniciar Vite para que cargue nuevamente el archivo de entorno.

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

### El botón de WhatsApp está deshabilitado

- Escribir una descripción en el formulario de soporte.
- Confirmar que `VITE_SUPPORT_WHATSAPP_NUMBER` tenga únicamente dígitos.
- Reiniciar Vite después de modificar `.env.development`.
- Hacer una recarga forzada del navegador si todavía se muestra la configuración anterior.

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
