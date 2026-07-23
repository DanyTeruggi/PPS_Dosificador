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

### Formularios seguros y accesibles

- Los botones de guardado se deshabilitan durante cada solicitud y muestran el estado de progreso.
- Cada controlador incorpora un bloqueo adicional para evitar envíos duplicados.
- Las validaciones `422` de FastAPI conservan la ruta del campo y se muestran en el formulario.
- Las operaciones exitosas se confirman mediante una notificación o una navegación inequívoca.
- Si falla solamente la imagen del simulador, se puede reintentar su carga sin crear otro monitoreo.

### Administrador

- Dashboard de escritorio con navegación por paneles.
- Listado, búsqueda, filtrado, creación y edición de usuarios.
- Activación y desactivación de cuentas de clientes y veterinarios.
- Protección visual y lógica que impide desactivar cuentas administrativas desde el panel.
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
├── assets/                         Imágenes, logos, fondos y texturas SVG
├── components/
│   ├── AuthenticatedImage/         Descarga y muestra imágenes protegidas con JWT
│   ├── BebederoCard/               Tarjeta mobile de estado y detalle de un bebedero
│   ├── Button/                     Botón general con variantes y estado disabled
│   ├── ButtonSearch/               Acciones de búsqueda y limpieza
│   ├── ButtonTable/                Acciones de edición y eliminación en tablas
│   ├── ButtonX/                    Botón accesible para cerrar modales
│   ├── Dashboard/
│   │   ├── BebederosPanel/
│   │   │   ├── BebederosPanel.tsx
│   │   │   ├── NuevoBebederoForm.tsx
│   │   │   ├── EditaBebederoForm.tsx
│   │   │   └── CargaImagen.tsx    Simulador de lectura e imagen, sólo en desarrollo
│   │   ├── EstablecimientoPanel/
│   │   │   ├── EstablecimientoPanel.tsx
│   │   │   ├── NuevoEstablecimientoForm.tsx
│   │   │   └── EditarEstablecimientoForm.tsx
│   │   ├── NavTabs/                Navegación entre paneles del dashboard
│   │   ├── ReportsPanel/
│   │   │   ├── ReportsPanel.tsx
│   │   │   └── ReportsGraficos.tsx
│   │   ├── Styles/                 CSS Modules compartidos por los paneles y formularios
│   │   └── UsersPanel/
│   │       ├── UsersPanel.tsx
│   │       ├── EditUserForm.tsx
│   │       ├── AsignarVeterinario.tsx
│   │       ├── ClientesAsociados.tsx
│   │       ├── assignmentUtils.ts
│   │       └── userStatusUtils.ts       Regla de protección del estado administrativo
│   ├── EmptyState/                 Estado vacío reutilizable
│   ├── Footer/                     Navegación inferior mobile y pie desktop
│   ├── Header/                     Encabezados de escritorio y mobile
│   ├── SupportWhatsAppModal/       Formulario de contacto con soporte
│   ├── UserForm/                   Alta pública y administrativa de usuarios
│   ├── ProtectedRoute.tsx          Protección por sesión y rol
│   └── SmartHomeRedirect.tsx       Redirección inicial según el rol
├── context/
│   ├── AuthContext.tsx             Sesión, login, logout y validación del JWT
│   ├── authContextDefinition.ts    Tipos y definición del contexto
│   └── useAuth.ts                  Hook de acceso al contexto
├── hooks/
│   ├── useEstablecimientoBebederos.ts
│   └── useIsDesktop.ts
├── layouts/
│   ├── PublicLayout.tsx
│   └── PrivateLayout.tsx
├── pages/
│   ├── LandingDesktop/
│   │   ├── DesktopLoginPage.tsx   Login exclusivo de administradores
│   │   └── HomePageDashboard.tsx  Contenedor de los paneles administrativos
│   ├── LandingMobile/
│   │   ├── WelcomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NuevoUsuarioPage.tsx
│   │   ├── LandingMobileLayout.tsx
│   │   ├── LandingHeader.tsx
│   │   ├── LandingClientes.tsx
│   │   ├── LandingEstablecimientos.tsx
│   │   ├── NuevoEstablecimientoClienteForm.tsx
│   │   ├── LandingBebederos.tsx
│   │   ├── LandingResumen.tsx
│   │   └── LandingPageStatus.tsx
│   └── LandingSelector.tsx        Selecciona experiencia desktop o mobile
├── styles/
│   └── global.css
├── types/                          Modelos y contratos de la API
├── utils/
│   ├── apiFetch.ts                 Cliente HTTP autenticado
│   ├── apiError.ts                 Errores generales y de campo de FastAPI
│   ├── formatBusinessName.ts
│   └── getInitials.ts
├── App.tsx                         Router y composición principal
└── main.tsx                        Punto de entrada de React
```

Cada componente visual mantiene su CSS Module junto al archivo TypeScript correspondiente. Los dos archivos de `Dashboard/Styles` son la excepción intencional: concentran estilos comunes utilizados por varios paneles y formularios administrativos.

### Componente `EmptyState`

`src/components/EmptyState/` centraliza los mensajes que se muestran cuando una consulta terminó correctamente, pero no existen datos asociados. No representa un error ni un estado de carga.

- `EmptyState.tsx` recibe una propiedad `message: string` y renderiza el texto con `role="status"` para que también pueda ser anunciado por tecnologías de asistencia.
- `EmptyState.module.css` define el fondo claro, espaciado, bordes redondeados y texto centrado del mensaje.
- Actualmente se utiliza para informar que no hay clientes, establecimientos, bebederos o mediciones disponibles.

Ejemplo:

```tsx
<EmptyState message="Este establecimiento no tiene bebederos asociados." />
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
| `npm test` | Ejecuta una vez todas las pruebas unitarias |
| `npm run test:watch` | Mantiene Vitest activo y repite las pruebas al guardar cambios |
| `npm run test:coverage` | Ejecuta las pruebas y genera el reporte de cobertura |

Antes de integrar cambios se recomienda ejecutar:

```bash
npm test
npm run lint
npm run build
```

## Pruebas unitarias

### ¿Qué es una prueba unitaria?

Una prueba unitaria comprueba automáticamente una función pequeña y aislada. La prueba proporciona datos de entrada, ejecuta la función y compara el resultado real con el esperado.

Ejemplo simplificado:

```ts
expect(getInitials("Juan Pérez")).toBe("JP");
```

Si un cambio futuro hace que `getInitials("Juan Pérez")` deje de devolver `JP`, Vitest marcará esa prueba como fallida. Esto permite detectar regresiones sin revisar manualmente toda la aplicación.

Las pruebas unitarias de este proyecto:

- No abren un navegador.
- No necesitan que el backend esté ejecutándose.
- No modifican la base de datos.
- Simulan las respuestas HTTP necesarias con objetos `Response`.
- Simulan funciones externas mediante mocks de Vitest.

### Herramientas utilizadas

- **Vitest**: ejecuta y organiza las pruebas.
- **Vitest Coverage con V8**: mide qué partes de los módulos seleccionados fueron ejecutadas.
- **Mocks de Vitest**: reemplazan temporalmente dependencias como `apiFetch`.

La configuración se encuentra en `vite.config.ts`, dentro de la propiedad `test`.

### Módulos cubiertos

| Archivo probado | Archivo de pruebas | Comportamiento verificado |
|---|---|---|
| `src/utils/getInitials.ts` | `src/utils/getInitials.test.ts` | Nombres simples, compuestos, espacios y valores vacíos |
| `src/utils/formatBusinessName.ts` | `src/utils/formatBusinessName.test.ts` | Capitalización, espacios y terminaciones S.A., S.A.S. y S.R.L. |
| `src/utils/apiError.ts` | `src/utils/apiError.test.ts` | Errores 401, 403, 409, 422 y 500, JSON inválido y errores por campo de FastAPI |
| `src/components/Dashboard/UsersPanel/assignmentUtils.ts` | `assignmentUtils.test.ts` en la misma carpeta | Obtención de IDs y solicitud de reasignación de veterinarios |
| `src/components/Dashboard/UsersPanel/userStatusUtils.ts` | `userStatusUtils.test.ts` en la misma carpeta | Roles autorizados para activar o desactivar usuarios |

La suite contiene **41 casos de prueba** distribuidos en cinco archivos.

### Cómo ejecutar las pruebas

Desde la carpeta `frontend`:

```bash
npm test
```

El comando ejecuta todas las pruebas una vez y termina. Un resultado correcto se ve de forma similar a:

```text
Test Files  5 passed (5)
Tests       41 passed (41)
```

Significado:

- `Test Files`: cantidad de archivos de pruebas.
- `Tests`: cantidad total de casos individuales.
- `passed`: pruebas que obtuvieron el resultado esperado.
- `failed`: pruebas cuyo resultado fue diferente; el cambio no debería integrarse hasta revisarlas.

### Modo de observación

Durante el desarrollo puede utilizarse:

```bash
npm run test:watch
```

Vitest queda abierto y vuelve a ejecutar las pruebas relacionadas cada vez que se guarda un archivo. Para salir se puede presionar `q` o `Ctrl+C`.

### Cobertura

La cobertura indica qué porcentaje del código seleccionado fue ejecutado por las pruebas:

```bash
npm run test:coverage
```

El reporte presenta cuatro métricas:

- **Statements**: instrucciones ejecutadas.
- **Branches**: caminos de decisión recorridos, por ejemplo los dos resultados de un `if`.
- **Functions**: funciones llamadas.
- **Lines**: líneas ejecutadas.

También se genera `coverage/index.html`. Puede abrirse en un navegador para ver, línea por línea, qué quedó cubierto. La carpeta `coverage/` es un resultado temporal y está excluida de Git.

Una cobertura alta no garantiza por sí sola que las pruebas sean buenas. Los casos deben comprobar resultados útiles, errores y situaciones límite; no deben escribirse únicamente para alcanzar un porcentaje.

### Cómo leer una prueba

Las pruebas siguen la estructura Arrange, Act, Assert:

1. **Arrange**: preparar los datos y mocks.
2. **Act**: ejecutar la función.
3. **Assert**: comprobar el resultado con `expect`.

Ejemplo:

```ts
it("usa las iniciales del nombre y del apellido", () => {
  // Arrange: el texto de entrada es "Juan Pérez".
  // Act: getInitials procesa el texto.
  const result = getInitials("Juan Pérez");

  // Assert: se comprueba el resultado esperado.
  expect(result).toBe("JP");
});
```

### Cómo agregar una prueba nueva

1. Crear un archivo junto al módulo con el sufijo `.test.ts`.
2. Importar `describe`, `it` y `expect` desde `vitest`.
3. Importar la función que se desea comprobar.
4. Agrupar los casos relacionados dentro de `describe`.
5. Escribir nombres que expliquen el comportamiento esperado.
6. Ejecutar `npm test`.
7. Corregir el código o la expectativa si una prueba falla.

Plantilla:

```ts
import { describe, expect, it } from "vitest";
import { funcion } from "./funcion";

describe("funcion", () => {
  it("describe claramente el resultado esperado", () => {
    expect(funcion("entrada")).toBe("resultado");
  });
});
```

### Alcance actual

Esta primera suite prueba lógica aislada. No cubre todavía interacción visual, navegación, login real ni recorridos completos en el navegador. Esos casos corresponden a pruebas de componentes, integración o end-to-end y pueden incorporarse posteriormente.

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
| `/` | `LandingSelector`: recupera la sesión y selecciona login desktop o bienvenida mobile según el viewport |
| `/login` | `LoginPage`: autenticación mobile y modal informativo de recuperación |
| `/home-desktop` | `DesktopLoginPage`: acceso exclusivo de administradores |
| `/home-mobile` | `WelcomePage`: bienvenida y acceso al login mobile |
| `/nuevo-usuario` | `NuevoUsuarioPage`: autorregistro de clientes o veterinarios |
| `/home` | `SmartHomeRedirect`: redirección automática al inicio correspondiente al rol |

### Protegidas

| Ruta | Roles | Descripción |
|---|---|---|
| `/dashboard` | Admin | `HomePageDashboard`, inicialmente en la pestaña Usuarios |
| `/dashboard/dispositivos` | Admin | El mismo dashboard, inicialmente en Dispositivos |
| `/dashboard/dispositivos/nuevo` | Admin | El mismo dashboard en Dispositivos; el alta se abre como modal |
| `/bebederos` | Autenticado | Panel de dispositivos sin restricción explícita de rol en el router |
| `/veterinarios/clientes` | Autenticado | Clientes asociados al veterinario |
| `/cliente/establecimientos` | Autenticado | Establecimientos propios o del cliente seleccionado por un veterinario |
| `/establecimiento/:id/bebederos` | Autenticado | Bebederos del establecimiento indicado |
| `/establecimiento/:id/resumen` | Autenticado | Resumen del mismo establecimiento |

El componente `ProtectedRoute` controla sesión y roles en la interfaz. Las tres rutas del dashboard exigen explícitamente `admin`; las restantes rutas privadas sólo exigen autenticación. La autorización definitiva y la propiedad de cada recurso corresponden al backend.

El dashboard contiene las pestañas Usuarios, Establecimientos, Dispositivos y Reportes. Excepto por las rutas iniciales de Dispositivos, el cambio de pestaña se mantiene como estado local y no crea una URL nueva. Los formularios administrativos se abren como modales, no como rutas independientes.

No existe actualmente una ruta comodín (`*`) ni una página 404.

### Protección del estado de administradores

En el panel Usuarios, el switch de estado se habilita únicamente para los roles `cliente` y `veterinario`. Las filas con rol `admin` muestran el control bloqueado y una explicación al posicionar el puntero. Si se intenta presionar ese switch, un toast con ícono de candado informa que las cuentas administrativas no pueden desactivarse.

La protección se aplica en dos lugares:

1. El checkbox utiliza `disabled`, por lo que no puede accionarse desde la interfaz.
2. `toggleEstadoUsuario` vuelve a comprobar el rol antes de llamar al backend.

La regla se encuentra en `userStatusUtils.ts` y adopta una política segura: un rol desconocido o ausente tampoco puede cambiar de estado. Sus seis casos unitarios comprueban clientes, veterinarios, administradores, mayúsculas, espacios, roles desconocidos y valores ausentes.

Esta restricción pertenece actualmente al frontend. Para una protección completa, el backend también debería impedir la desactivación del último administrador activo; esa validación queda fuera del alcance actual.

## Formularios y tratamiento de errores

| Formulario | Ubicación | Operación |
|---|---|---|
| Login desktop | `src/pages/LandingDesktop/DesktopLoginPage.tsx` | Autenticación exclusiva de administradores |
| Login mobile | `src/pages/LandingMobile/LoginPage.tsx` | Autenticación y redirección por rol |
| Registro/alta de usuario | `src/components/UserForm/UserForm.tsx` | Autorregistro o creación administrativa según `mode` |
| Nuevo establecimiento del cliente | `src/pages/LandingMobile/NuevoEstablecimientoClienteForm.tsx` | Alta sobre la cuenta autenticada |
| Alta/edición de establecimiento | `src/components/Dashboard/EstablecimientoPanel/` | Gestión administrativa |
| Alta/edición de bebedero | `src/components/Dashboard/BebederosPanel/` | Gestión administrativa |
| Simulación de lectura e imagen | `src/components/Dashboard/BebederosPanel/CargaImagen.tsx` | Ingesta secuencial con API key de hardware |
| Edición de usuario | `src/components/Dashboard/UsersPanel/EditUserForm.tsx` | Actualización del usuario y de su perfil |
| Asignación de veterinario | `src/components/Dashboard/UsersPanel/AsignarVeterinario.tsx` | Reasignación del cliente |
| Soporte por WhatsApp | `src/components/SupportWhatsAppModal/` | Prepara un mensaje y abre WhatsApp |

Los envíos HTTP implementan las siguientes reglas:

- El botón principal y las acciones que podrían cerrar el formulario se bloquean mientras existe una solicitud activa.
- Los controladores ignoran nuevos intentos durante el envío para prevenir solicitudes duplicadas.
- `apiError.ts` interpreta `detail` de FastAPI. En errores de validación conserva el último segmento de `loc` para asociar el mensaje al campo correspondiente.
- Los errores de red, autorización o respuestas sin campo se muestran como errores generales.
- Las operaciones exitosas se confirman mediante `react-hot-toast`, un resultado visible o la navegación al destino autenticado.
- La recuperación de contraseña es actualmente informativa y no llama a un endpoint.

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

### Endpoints de autenticación y registro

| Método | Endpoint | Uso |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Obtención del JWT |
| `GET` | `/api/v1/auth/me` | Validación y recuperación de la sesión |
| `POST` | `/api/v1/auth/register` | Autorregistro de clientes y veterinarios |
| `POST` | `/api/v1/admin/administradores` | Alta administrativa de un administrador |
| `POST` | `/api/v1/admin/clientes` | Alta administrativa de un cliente |
| `POST` | `/api/v1/admin/veterinarios` | Alta administrativa de un veterinario |

### Endpoints de clientes, veterinarios y establecimientos

| Método | Endpoint | Uso |
|---|---|---|
| `GET` | `/api/v1/clientes/me` | Perfil del cliente autenticado |
| `GET` | `/api/v1/clientes/mis-establecimientos` | Establecimientos del cliente |
| `POST` | `/api/v1/clientes/me/establecimientos` | Alta de un establecimiento propio |
| `GET` | `/api/v1/veterinarios/me` | Perfil y clientes del veterinario |
| `GET` | `/api/v1/veterinarios/clientes` | Relaciones del veterinario |
| `GET` | `/api/v1/veterinarios/clientes/{id}/establecimientos` | Establecimientos de un cliente asociado |
| `GET` | `/api/v1/establecimientos/{id}` | Detalle de un establecimiento |
| `GET` | `/api/v1/bebederos/{id}` | Detalle de un bebedero |

`AuthenticatedImage` también solicita mediante `useApi` la URL de imagen recibida desde el backend, de modo que la descarga incluye el JWT y puede cancelarse al desmontar el componente.

## Simulador de hardware

Durante el desarrollo, el panel administrativo **Dispositivos** muestra la acción **Simular lectura**. Esta herramienta reproduce temporalmente el comportamiento del dispositivo físico y sólo se renderiza cuando `import.meta.env.DEV` es verdadero.

Cada ejecución realiza el flujo real de ingesta de forma secuencial:

```text
POST /api/v1/bebederos/{bebedero_id}/monitoreo
    ↓ respuesta exitosa
POST /api/v1/bebederos/{bebedero_id}/imagenes
```

La imagen nunca se envía si falla la creación del monitoreo. El backend la asocia al monitoreo más reciente del bebedero, por lo que no deben ejecutarse ambas solicitudes en paralelo. Si el monitoreo se crea pero falla la imagen, el botón cambia a **Reintentar imagen** y el siguiente envío no crea otra medición.

### Generar la API key del dispositivo

Los endpoints de ingesta no usan el JWT del administrador. Requieren la cabecera:

```http
X-API-Key: <clave-del-dispositivo>
```

La clave se genera desde la raíz del backend mediante su CLI. Para el bebedero `25`:

```powershell
.\venv\Scripts\python.exe -m app.cli.device_api_key 25
```

Ejecutar esa instrucción en una terminal PowerShell ubicada en la carpeta raíz del backend. El comando imprime únicamente la `X-API-Key`; copiar su salida y pegarla en el campo **API key del dispositivo** del simulador. El número final es el `bebedero_id` y debe reemplazarse por el ID seleccionado en el formulario.

El ID utilizado en el comando debe coincidir exactamente con el dispositivo seleccionado en el simulador. Para otro bebedero se debe generar su propia clave:

```powershell
.\venv\Scripts\python.exe -m app.cli.device_api_key 26
```

La API key:

- Es determinística para la combinación `bebedero_id + HARDWARE_API_KEY_SECRET`.
- Se reutiliza para todas las mediciones e imágenes del mismo bebedero.
- No cambia entre lecturas ni por utilizar otra fecha u horario.
- No sirve para un bebedero con otro ID.
- Debe regenerarse si cambia `HARDWARE_API_KEY_SECRET` en el backend.
- No debe almacenarse en el frontend, `localStorage` ni variables `VITE_*`.

El simulador mantiene la clave solamente en memoria y la limpia después de completar el flujo. Un `401` de estos endpoints se interpreta como una API key inválida y no cierra la sesión administrativa.

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

La cobertura se valida en la interfaz entre `0` y `100`. Los valores numéricos opcionales vacíos y el mensaje de error vacío se envían como `null`.

La imagen se convierte a Base64 y se envía con un nombre único. Para las pruebas se aceptan JPEG, PNG y WebP de hasta 5 MB. La operación crea registros reales en el backend configurado.

### Probar otra lectura del mismo bebedero

Para subir otra imagen con un horario diferente:

1. Seleccionar nuevamente el mismo bebedero.
2. Usar la misma API key.
3. Indicar la nueva fecha y hora y los valores de la medición.
4. Seleccionar la nueva imagen.
5. Ejecutar **Enviar lectura e imagen**.

El simulador crea primero un monitoreo nuevo y luego carga su imagen. No se debe subir solamente la imagen si se pretende representar una lectura nueva, porque quedaría asociada al monitoreo más reciente existente.

### Verificación en la interfaz mobile

Después de completar la simulación, iniciar sesión como el cliente propietario o su veterinario, ingresar al establecimiento y abrir el bebedero. `BebederoCard` descarga la imagen protegida con JWT, la muestra completa y permite ampliarla al tocarla.

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
3. Pulsar **Enviar WhatsApp**.

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

## Autor

**Sergio Daniel Teruggi**

- Tecnicatura Universitaria en Desarrollo de Aplicaciones Informáticas.
- Universidad Nacional del Centro de la Provincia de Buenos Aires.
- Proyecto: PPS Dosificador.
- Correo: [sdteruggi@gmail.com](mailto:sdteruggi@gmail.com).
- GitHub: [DanyTeruggi/PPS_Dosificador](https://github.com/DanyTeruggi/PPS_Dosificador).

Desarrollado como parte de la Práctica Profesional Supervisada.

## Información académica

- **Autor:** Sergio Daniel Teruggi.
- **Carrera:** Tecnicatura Universitaria en Desarrollo de Aplicaciones Informáticas.
- **Materia:** Práctica Profesional Supervisada.
- **Institución:** UNICEN.
- **Año:** 2026.
- **Docente/Tutor:** Dr. Toloza Juan M.
