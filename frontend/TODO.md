# Tareas pendientes

Este documento reúne los pendientes detectados durante la revisión del frontend.

## Funcionalidad

- [ ] Implementar la recuperación de contraseña.
  - Reemplazar el mensaje temporal de `LoginPage` por el flujo real.
  - Definir el endpoint del backend y el mecanismo de recuperación.
  - Informar correctamente los estados de carga, éxito y error.

- [ ] Restringir todas las rutas privadas según el rol autorizado.
  - `admin`: rutas del dashboard.
  - `veterinario`: listado de clientes y navegación relacionada.
  - `cliente`: establecimientos propios y navegación relacionada.
  - Verificar que escribir manualmente una URL de otro rol no permita acceder a esa pantalla.

- [ ] Agregar una ruta comodín y una pantalla para URLs inexistentes.
  - Registrar una ruta `*` en `App.tsx`.
  - Ofrecer una acción para volver al inicio correspondiente al estado de la sesión.
  - Comprobar el comportamiento tanto desde rutas públicas como privadas.

## Refactorización

- [ ] Evitar que los formularios de login lean y parseen directamente `sessionStorage`.
  - Hacer que `login` devuelva el usuario autenticado o consumir el usuario normalizado desde el contexto.
  - Eliminar el `JSON.parse` sin tipado de `LoginPage` y `DesktopLoginPage`.

- [ ] Evaluar la creación de un componente reutilizable para las opciones de autocompletado.
  - El patrón de botón con título y descripción se repite en los formularios de establecimientos, bebederos y asignación de clientes.
  - El componente debe conservar las propiedades nativas del botón y los atributos ARIA.
  - No reutilizar el componente `Button` general si obliga a perder la estructura o semántica de `role="option"`.

## Accesibilidad

- [ ] Asociar explícitamente las etiquetas de los formularios con sus controles.
  - Agregar pares `htmlFor`/`id` en formularios de usuarios, establecimientos, dispositivos, reportes y simulación.
  - Mantener etiquetas envolventes únicamente cuando el control esté realmente anidado.

- [ ] Unificar el comportamiento accesible de los modales.
  - Agregar `role="dialog"`, `aria-modal` y un nombre accesible a los modales del dashboard que todavía son contenedores genéricos.
  - Mover el foco al abrir, contener la navegación con Tab, cerrar con Escape y devolver el foco al disparador.

## Pruebas

- [ ] Incorporar pruebas de componentes, integración y navegación.
  - Cubrir `ProtectedRoute`, `SmartHomeRedirect` y los formularios de login para los tres roles.
  - Verificar la navegación por teclado de los autocompletados y el manejo de foco de los modales.
  - Configurar un entorno DOM para Vitest o agregar pruebas end-to-end para los recorridos principales.

- [ ] Mantener alineada la configuración de cobertura con las utilidades probadas.
  - Incluir `src/utils/roleHome.ts` en `coverage.include`.
  - Revisar la lista cuando se agreguen nuevas utilidades con pruebas.

## Imágenes

- [ ] Completar el flujo definitivo de carga y visualización de imágenes.
  - Confirmar el contrato final del backend para subir y consultar imágenes protegidas.
  - Evaluar el reemplazo del envío en Base64 por `multipart/form-data` si el backend adopta ese formato.
  - Integrar `AuthenticatedImage` en las pantallas donde se muestran mediciones.
  - Verificar autenticación, estados de carga, errores y reintentos.
  - Validar formato, tamaño máximo y tipo MIME en frontend y backend.
  - Definir si `CargaImagen` seguirá disponible en producción o será exclusivamente una herramienta de desarrollo.
  - Agregar pruebas del flujo de carga, error parcial y visualización.

## Limpieza

- [ ] Revisar la advertencia de Vite sobre archivos JavaScript mayores a 500 kB.
  - Evaluar carga diferida de pantallas o módulos pesados.
  - Confirmar si la división del bundle aporta una mejora medible antes de modificar la configuración.

## Verificación final

- [ ] Ejecutar `npm run lint`.
- [ ] Ejecutar `npm test`.
- [ ] Ejecutar `npm run build`.
- [ ] Probar manualmente el acceso y las redirecciones de `admin`, `veterinario` y `cliente`.
