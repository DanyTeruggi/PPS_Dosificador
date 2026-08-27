# Tareas pendientes

Este documento reúne los pendientes detectados durante la primer Demo.

## Funcionalidad

- [ ] Permitir que el veterinario edite la configuración de los bebederos pertenecientes a sus clientes asignados.
  - Habilitar la edición de `Tiempo dosis (hs)`, `Largo (cm)`, `Ancho (cm)` y `Profundidad (cm)`.
  - Mantener los nombres del contrato actual: `tiempo_dosis`, `largo`, `ancho` y `profundidad`, respectivamente.
  - Mostrar la opción de edición únicamente para bebederos de clientes vinculados al veterinario autenticado.
  - Validar tanto en frontend como en backend que el veterinario tenga acceso al cliente, establecimiento y bebedero antes de guardar los cambios.
  - Registrar quién realizó la modificación, la fecha y los valores anteriores y nuevos.

- [ ] Implementar un sistema de alertas para clientes y veterinarios.
  - Notificar ante una dosis insuficiente o una sobredosis.
  - Alertar por nivel bajo de batería o pérdida de alimentación eléctrica.
  - Alertar por bajo volumen de agua en el bebedero.
  - Alertar por bajo nivel de stock en la tolva.
  - Detectar la ausencia de lecturas una vez superado el intervalo mínimo esperado según la dosificación programada.
  - Alertar cuando una dosis programada no se ejecute, se ejecute fuera de horario o el dosificador se bloquee.
  - Detectar sensores desconectados, lecturas inválidas o valores fuera de rango.
  - Alertar por pérdida de comunicación con el dispositivo o cuando permanezca fuera de línea.
  - Detectar un nivel de agua anormalmente alto o una variación brusca que pueda indicar desborde o fuga.
  - Definir severidad, destinatarios y canales de notificación para cada tipo de alerta.
  - Evitar notificaciones duplicadas, permitir confirmar su recepción y registrar su resolución.
  - Mantener un historial con fecha, dispositivo, establecimiento, causa, estado y usuario responsable.
  

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


## Backup

- [ ] Implementar una base de datos de resguardo para proteger la información del sistema ante fallos, errores humanos o pérdida de datos.
  - Crear copias periódicas y automáticas de la base de datos.
  - Incluir usuarios, establecimientos, bebederos, configuraciones, mediciones, alertas y relaciones entre clientes y veterinarios.
  - Respaldar las imágenes y los archivos asociados a las mediciones.
  - Almacenar las copias de forma segura y separadas del servidor principal.
  - Definir una política de retención para respaldos diarios, semanales y mensuales.
  - Cifrar los archivos que contengan información sensible y restringir su acceso al personal autorizado.
  - Registrar la fecha, el resultado y el tamaño de cada copia realizada.
  - Notificar al administrador cuando falle un respaldo.
  - Documentar el procedimiento de restauración de la información.
  - Ejecutar pruebas periódicas de recuperación para verificar la validez de las copias.
  - Definir el tiempo máximo aceptable de pérdida de datos y el tiempo esperado de recuperación.
  - Evitar incorporar contraseñas, secretos, claves API o archivos de configuración sin cifrar.
