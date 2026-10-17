# 5 Preguntas Técnicas de Razonamiento Profundo — Orderflow Engine

Estas **5 preguntas** están formuladas estrictamente **dentro de los límites del enunciado original (`Prueba_Tecnica_Tech_Lead_1.pdf`) y del diseño entregado** (sin preguntar por funcionalidades fuera de alcance), pero apuntan a **puntos ciegos y casos borde reales** que no están respondidos en la documentación de `orderflow-engine-docs`.

---

## 1. El efecto del orden alfabético de los SKUs sobre el importe del descuento por familia (`BR-02` y `A-03`)

### Contexto técnico en la documentación
En `spec/SPEC.md` (`BR-02` y supuesto `A-03`) se define que, cuando una regla de descuento por escala aplica a una **familia** (como ocurre en el tenant de Ecuador `ec-alpha` para la familia `colas`), las unidades se asignan a los tramos marginales siguiendo el **orden normalizado (alfabético) del código de SKU**.
Alfabéticamente, `"BEV-COLA-1500"` (botella de 1,5 L, más cara) precede a `"BEV-COLA-350"` (lata de 350 ml, más barata). Como el primer tramo (unidades 1 a 11) tiene `0%` de descuento y el segundo tramo (12 a 23) tiene `4%`, las botellas más caras absorben siempre el tramo de `0%` y el porcentaje de descuento se aplica únicamente sobre las unidades más baratas.

### Pregunta
> *"En los descuentos marginales por familia (`BR-02`), definieron que las unidades se asignan a los tramos según el orden alfabético del código de SKU (`A-03`). Cuando un carrito combina presentaciones de distinto precio dentro de la misma familia —por ejemplo, `BEV-COLA-1500` y `BEV-COLA-350`—, ese orden alfabético hace que el SKU que empieza por `'1'` absorba siempre el tramo inicial del `0%` y el descuento recaiga sobre el SKU que empieza por `'3'`. ¿Por qué eligieron que la nomenclatura alfabética del SKU determine qué precio unitario recibe cada tramo en vez de prorratear el descuento de la familia o asignar por precio unitario?"*

---

## 2. Colisión de combos resuelta por orden de `UUIDv7` en lugar de beneficio comercial (`BR-03` y `data-model.md`)

### Contexto técnico en la documentación
En `spec/SPEC.md` (`BR-03`) se establece que cuando varios combos pueden aplicarse a un mismo carrito, se evalúan en **orden de `combo_id`**, consumiendo cada uno las unidades que deja el anterior. Por su parte, en `spec/data-model.md` (§0 y §2) se define que los identificadores son `UUIDv7` (cuyo orden natural corresponde al instante de creación del registro) y la tabla `combo_rules` no posee una columna de prioridad comercial.

### Pregunta
> *"La especificación indica que cuando dos combos activos compiten por las mismas unidades del carrito, se evalúan en orden de `combo_id`, el cual es un `UUIDv7` generado al insertar la regla. Si un tendero arma un carrito que cumple dos combos solapados, esto significa que siempre ganará el combo que fue creado primero en base de datos, aunque otorgue un descuento menor que el segundo. ¿Fue una decisión consciente que la antigüedad del registro (`UUIDv7`) defina la prioridad comercial entre combos sin evaluar cuál da mejor precio al cliente?"*

---

## 3. El diagnóstico de `409 IDEMPOTENCY_KEY_IN_PROGRESS` cuando el bloqueo ocurre en el cupo de crédito y no en la llave (`SPEC §7.1` vs `plan.md RISK-01`)

### Contexto técnico en la documentación
En la confirmación del pedido (`spec/SPEC.md` §7.1), una única transacción adquiere bloqueos en tres tablas distintas en orden fijo: **Paso 1 (`idempotency_keys`) → Paso 2 (`quotes`) → Paso 3 (`credit_accounts`)**, bajo un único `lock_timeout` de transacción. En `spec/plan.md` (`RISK-01`) se indica que, ante contención en la fila de crédito de un cliente bajo ráfagas de confirmaciones, si expira el `lock_timeout` el servicio responde `409 IDEMPOTENCY_KEY_IN_PROGRESS`.

### Pregunta
> *"En `RISK-01` explican que si dos confirmaciones concurrentes del mismo cliente compiten por el bloqueo de su fila en `credit_accounts` (Paso 3) y vence el `lock_timeout`, el servicio responde `409 IDEMPOTENCY_KEY_IN_PROGRESS`. Sin embargo, si se trata de dos cotizaciones distintas confirmadas en paralelo —cada una con su propio `Idempotency-Key`—, la colisión ocurre en el Paso 3 (`credit_accounts`) o en el Paso 2 (`quotes`), no en el Paso 1 (`idempotency_keys`). ¿Cómo distingue el manejo de excepciones de JDBC en cuál de los tres bloqueos expiró el `lock_timeout`, o por qué se le informa al cliente que su `Idempotency-Key` sigue en progreso cuando en realidad esperó por la fila de crédito de otra orden?"*

---

## 4. Cómo garantiza el `OutboxRelay` que "solo el dueño del lease marca el resultado" si la tabla no tiene token de lease (`ADR-0001` vs `data-model.md §5`)

### Contexto técnico en la documentación
En el checklist de *code review* del `ADR-0001` se exige verificar que *"el relay envía sin transacción abierta, y solo quien tiene el lease marca el resultado"*. Sin embargo, al revisar las columnas de la tabla `outbox_events` en `spec/data-model.md` §5, solo existe la columna de tiempo `locked_until` (`timestamptz`), **sin ninguna columna `lease_token`, `worker_id` ni versión del reclamo**.

### Pregunta
> *"En el ADR señalan como punto clave de revisión que el `OutboxRelay` llama al ERP fuera de la transacción y que 'solo quien tiene el lease marca el resultado'. No obstante, en el modelo de datos la tabla `outbox_events` solo tiene la columna `locked_until` y no guarda ningún identificador de instancia o token de lease (*fencing token*). Si el Worker A reclama un evento, sufre una pausa de red o de GC mayor a los 30 segundos del lease, el Worker B reclama ese mismo evento, y justo después el Worker A despierta e intenta actualizar el estado, ¿qué condición exacta en el `WHERE` del `UPDATE` impide que el Worker A sobrescriba el estado del Worker B si la fila no guarda quién tomó el lease?"*

---

## 5. Divergencia del campo `description` entre un replay idempotente (`E-03`) y la consulta del pedido (`E-04`) (`data-model.md §6` vs `SPEC §7.3`)

### Contexto técnico en la documentación
Para garantizar que el pedido no cambie tras cotizarse, `quote_lines` captura `unit_price` y `tax_rate`, pero `spec/data-model.md` §6 declara explícitamente que `description` **no se captura en `quote_lines`**, sino que se lee en vivo de `products.name` (*"current name, not captured"*). Al mismo tiempo, `spec/SPEC.md` §7.3 exige que un reintento de `POST /api/v1/orders` devuelva byte por byte el `response_body` guardado en `idempotency_keys` (que sí tiene congelado el `description` del momento del commit), mientras que `GET /api/v1/orders/{orderId}` (`E-04`) reconstruye el cuerpo leyendo `products.name`.

### Pregunta
> *"En `data-model.md` §6 especifican que `quote_lines` captura precios y tasas de impuesto en el instante `T`, pero que el campo `description` del desglose se lee siempre del valor actual de `products.name` sin capturarse en la línea. Dado que al confirmar la orden (`E-03`) la tabla `idempotency_keys` congela el `response_body` completo en binario, mientras que `GET /api/v1/orders/{orderId}` (`E-04`) y el payload del Outbox reconstruyen el pedido desde las tablas, ¿por qué decidieron dejar `description` fuera del sellado de `quote_lines` permitiendo que `E-03` (en replay) y `E-04` devuelvan textos distintos si se corrige el nombre de un producto?"*
