# Tareas pendientes

Este documento reúne los pendientes detectados durante la primer Demo.

## Funcionalidad

- [ ] Implementar la recuperación de contraseña.
  - Reemplazar el mensaje temporal de `LoginPage` por el flujo real.
  - Definir el endpoint del backend y el mecanismo de recuperación.
  - Informar correctamente los estados de carga, éxito y error.



## Imágenes

- [ ] Completar el flujo definitivo de carga y visualización de imágenes.
  - Confirmar el contrato final del backend para subir y consultar imágenes protegidas.
  - Evaluar el reemplazo del envío en Base64 por `multipart/form-data` si el backend adopta ese formato.
  - Integrar `AuthenticatedImage` en las pantallas donde se muestran mediciones.
  - Verificar autenticación, estados de carga, errores y reintentos.
  - Validar formato, tamaño máximo y tipo MIME en frontend y backend.
  - `CargaImagen` será exclusivamente una herramienta de desarrollo.


## Carga bacteriana por lote

- [ ] Incorporar el registro y seguimiento de la carga bacteriana de cada lote.
  - Definir qué representa un lote, cómo se identifica y a qué establecimiento pertenece.
  - Registrar el valor de carga bacteriana, unidad de medida, fecha de análisis y origen de la muestra.
  - Permitir consultar el historial de análisis bacteriológicos del lote.

- [ ] Comparar la carga bacteriana con las cápsulas suministradas y las mediciones de los bebederos.
  - Mostrar la evolución bacteriana antes y después de cada suministro.
