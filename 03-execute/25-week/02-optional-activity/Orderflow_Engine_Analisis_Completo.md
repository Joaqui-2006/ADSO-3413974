# Orderflow Engine — Informe Único y Completo

Este documento reúne en un **único archivo** todo el análisis del proyecto **Orderflow Engine**:
1. **Parte 1:** ¿Qué es, qué hace y qué funcionalidades tiene el proyecto?
2. **Parte 2:** ¿Qué pide el enunciado original (`Prueba_Tecnica_Tech_Lead_1.pdf`) y cómo cumple el proyecto cada requisito punto por punto?
3. **Parte 3:** Errores, incongruencias y desfases encontrados en la auditoría del repositorio.
4. **Parte 4:** Las 24 trampas técnicas encontradas (`TR-01` a `TR-15` y `RF-1` a `RF-9`) explicadas de forma clara.

---

## Parte 1: ¿Qué es, qué hace y qué funcionalidades tiene?

### 1.1. ¿Qué es Orderflow Engine?
Es el **motor de cálculo de precios (*pricing engine*) y confirmación idempotente de pedidos** para un **marketplace B2B de bebidas** donde tenderos realizan compras a distribuidores.
- Opera sobre una arquitectura **multi-país y multi-marca (*multi-tenant*)** con datos precargados para **Colombia (`COP`), Ecuador (`USD`), Guatemala (`GTQ`) y Perú (`PEN`)** (`spec/SPEC.md` §5).
- El espacio de trabajo completo está dividido en **6 repositorios** (`docs`, `api`, `web`, `infra`, `tools`, `app`). Este archivo ZIP (`orderflow-engine-docs`) contiene la especificación viva, el modelo de datos, el contrato de la API, los 9 diagramas SVG, las reglas de gobernanza y el ADR-0001 en Word y PDF (`handoff/HANDOFF.md` §2).
- **Stack tecnológico:** Java 21 · Spring Boot · PostgreSQL 17 · Liquibase · JUnit 5 + Testcontainers · ArchUnit · JaCoCo · PIT · Angular · Docker (`spec/SPEC.md` §0).

### 1.2. ¿Qué hace y qué garantiza?
El sistema resuelve dos problemas críticos del comercio B2B: **calcular precios complejos con promociones e impuestos sin errores de redondeo** y **confirmar pedidos bajo alta concurrencia o fallos de red sin cobrar ni despachar dos veces**, sosteniendo **cuatro garantías innegociables** (`spec/SPEC.md` §0, `spec/constitution.md`):

| Código | Garantía | Mecanismo |
|--------|----------|-----------|
| **`G-1`** | **El total cotizado es idéntico al total confirmado**, aunque cambien los precios o promociones entre ambos momentos | La cotización se sella como *insert-only* (con vigencia TTL de 15 min). El pedido confirmado solo guarda una referencia a la cotización y no almacena ni recalcula ningún monto (`spec/SPEC.md` §6). |
| **`G-2`** | **Cero punto flotante para dinero.** Escala, regla y puntos de redondeo explícitos | Objeto de valor inmutable `Money(BigDecimal, CurrencyPolicy)` (prohibido `float`/`double` mediante ArchUnit). La escala (`COP` = 0, `USD`/`GTQ`/`PEN` = 2) y el modo de redondeo (`HALF_UP`) vienen de la tabla `countries`, y se redondea únicamente **por línea** para cuadrar con facturación electrónica (`spec/SPEC.md` §4). |
| **`G-3`** | **Un `201 Created` significa que el pedido existe y es consultable (`I-201`).** Los reintentos nunca duplican pedidos ni consumen cupo dos veces | Una única transacción ACID en PostgreSQL toma bloqueos en orden fijo (`idempotency_key → quote → credit_account`), actualiza el cupo, inserta el pedido, el movimiento en `credit_ledger` y los eventos de salida, y solo serializa el `201` **después del `COMMIT`** (`spec/SPEC.md` §7.1–§7.3). |
| **`G-4`** | **Los efectos externos (Push y ERP) nunca se pierden ni se aplican dos veces** | Patrón **Transactional Outbox** con un *relay* que reclama eventos mediante *leases* (`FOR UPDATE SKIP LOCKED`), llama a las pasarelas fuera de la transacción de base de datos, reintenta con *exponential backoff + jitter* y envía `event_id` para deduplicación en destino (`spec/SPEC.md` §7.4). |

### 1.3. Funcionalidades detalladas

#### A. Motor de Precios y Palancas Comerciales (`spec/SPEC.md` §3)
Evalúa el carrito siguiendo un pipeline puro y determinista en orden estricto:
1. **Normalización del carrito (`BR-00`):** Fusiona SKUs repetidos sumando sus cantidades, ordena las líneas por código de SKU y rechaza cantidades inválidas (`<= 0`, no enteras o `> 1,000,000`, tanto en líneas pagadas como en unidades de obsequio derivadas).
2. **Elegibilidad de Obsequios / Regalos (`BR-04` - `GIFT`):** Se evalúa sobre cantidades pagadas o subtotal bruto antes de descuentos. Agrega una línea separada (`isGift: true`, precio 0, neto 0) y aplica la política tributaria del país sobre el valor de referencia del regalo:
   - `EXEMPT`: base gravable 0 e impuesto 0.
   - `TAXED`: base gravable igual al valor de referencia del regalo (`qty * listPrice`); el cliente asume el impuesto.
3. **Combos (`BR-03` - `COMBO`):** Paquetes de productos en cantidades mínimas a precio fijo. Consumen unidades primero para evitar doble descuento con escalas. El descuento del combo se reparte proporcionalmente entre las líneas participantes mediante el **método del mayor resto (*largest remainder*)** para obtener la base gravable exacta de cada línea.
4. **Descuentos por Escala / Tramos (`BR-02` - `TIER`):** Descuentos marginales por tramos de unidades (por SKU o por familia, donde una regla por SKU excluye al producto de la regla por familia) aplicados solo sobre las unidades **no consumidas** por combos. Se redondea una sola vez por línea.
5. **Cálculo de Neto, Base Gravable, Impuesto por línea y Total (`BR-05`, `RP-1`…`RP-5`):** Los totales del pedido son sumas exactas de los valores ya redondeados por línea (nunca se re-redondean).
6. **Evaluación de Cupo de Crédito (`BR-06`):** En cotización (`CREDIT`) devuelve de forma informativa `{fits, available, shortfall}` sin reservar cupo. En confirmación ejecuta un `UPDATE` condicional atómico (`consumed + total <= credit_limit`) y registra el cargo en `credit_ledger`.

#### B. Contrato de la API REST (`spec/api-contract.md`)
Todas las operaciones de negocio exigen las cabeceras `X-Tenant-Id` y `X-Customer-Id`, soportan internacionalización (`Accept-Language: es | en`, español por defecto) y reportan errores en formato **RFC 9457 (`application/problem+json`)** con `code` estable y `correlationId`:
- **`E-01` `POST /api/v1/quotes`**: Crea y sella una cotización.
- **`E-02` `GET /api/v1/quotes/{quoteId}`**: Consulta una cotización con su estado derivado (`OPEN`, `CONFIRMED`, `EXPIRED`) y el cálculo de crédito actualizado si sigue `OPEN`.
- **`E-03` `POST /api/v1/orders`**: Confirma una cotización de forma idempotente (exige cabecera `Idempotency-Key`).
- **`E-04` `GET /api/v1/orders/{orderId}`**: Consulta un pedido confirmado (renderizado desde las líneas de su cotización).
- **`E-05` `GET /api/v1/orders?customerId={id}&size=20`**: Consulta el historial de pedidos del cliente (del más reciente al más antiguo).
- **`E-06` `GET /actuator/health`**: Estado de salud del servicio y la base de datos.
- **`E-07` `GET /api/v1/products`**: Catálogo de productos del tenant (solo lectura, ordenado por SKU).

#### C. Procesos en Segundo Plano (`spec/architecture.md` §3.4, `spec/SPEC.md` §12)
- **Outbox Relay:** Reclama eventos `PENDING`, invoca los puertos de Push y ERP fuera de transacción, marca `SENT`, programa reintentos con *backoff* o marca `DEAD` al agotar intentos, exponiendo las métricas `outbox_pending` y `outbox_dead`.
- **Retention Housekeeping:** Purga llaves de idempotencia (> 24 h), cotizaciones expiradas no confirmadas (> 7 días tras `expiresAt`) y eventos de outbox enviados (> 7 días). Las cotizaciones confirmadas nunca se borran.

#### D. Cliente Web en Angular (`spec/SPEC.md` §10)
Extiende la pantalla opcional de resumen de pedido a todo el flujo de compra en un solo origen (nginx redirige `/api/` hacia la API):
- **Rutas:** Carrito (`/cart` y `/`) → Resumen de cotización (`/quotes/:quoteId`) → Pedido confirmado (`/orders/:orderId`) → Historial "Mis pedidos" (`/orders`), con selector de tienda/país y cambio de idioma (`ES`/`EN`) en caliente.
- **Prevención de defectos a nivel de componente:** `ui-text` (cero truncamiento), `ui-action-bar` (controles siempre por encima de barras del sistema y del teclado móvil) y `ui-product-image` (proporción cuadrada uniforme).
- **Idempotencia y manejo de errores en cliente:** Genera y persiste un `Idempotency-Key` por cotización en el navegador, deshabilita el botón mientras la petición está en vuelo y ofrece una acción guiada para cada error (`ui-problem-notice`).

---

## Parte 2: ¿Qué pide el enunciado (`Prueba_Tecnica_Tech_Lead_1.pdf`) y cómo cumple el proyecto cada requisito?

### 2.1. Veredicto Ejecutivo de Cumplimiento

> **Veredicto general:** **SÍ CUMPLE AL 100%** con todos los requisitos funcionales, no funcionales, pruebas obligatorias (*golden tests*), garantías de concurrencia/idempotencia, el ADR de 1 página y el *plus* opcional de Frontend (21 de 21 puntos del enunciado cubiertos y verificados).
>
> **Única condición operativa antes de entregar:** Como este archivo ZIP corresponde solo al repositorio documental (`orderflow-engine-docs`), para que la entrega sea válida ante el evaluador se debe entregar el repositorio de código **`orderflow-engine-api`** (junto con sus repositorios hermanos) habiendo cerrado primero el merge de `dev → main` de la fase web (`T-17`, `T-19`, `T-20`) descrito en `handoff/HANDOFF.md` §3 y §11.

| Bloque del Enunciado | Requisitos Evaluados | Estado | Nivel de Calidad Técnica |
|----------------------|----------------------|--------|--------------------------|
| **Condiciones generales y contexto** | Ventana de 5 días, lenguaje permitido (Java/Spring Boot), multi-país (CO, EC, GT, PE) y multi-tenant | **Cumple (100%)** | Sobresaliente |
| **Parte A1 — Motor de cálculo** | Desglose por línea y totales, coexistencia y orden de 5 palancas, cupo de crédito, total cotizado = confirmado, sin punto flotante, multi-país en datos | **Cumple (100%)** | Sobresaliente (100% cobertura y 100% mutación PIT) |
| **Parte A1 — Golden Tests (1 al 6)** | 6 escenarios obligatorios de prueba sobre el motor y la regresión cotización-confirmación | **Cumple (100%)** | Sobresaliente (basados en fixtures JSON deterministas) |
| **Parte A2 — Confirmación e Idempotencia** | `POST /orders` idempotente, invariante del `201`, efectos Push y ERP vía Outbox sin pérdida ni duplicación, modelo de consistencia y sacrificios | **Cumple (100%)** | Sobresaliente (probado con concurrencia real e inyección de fallos en PostgreSQL 17) |
| **Parte A3 — ADR (máx. 1 página)** | Decisiones y descartes, qué no se implementó, checklist de *code review*, riesgo y mitigación en `<= 1` página | **Cumple (100%)** | Sobresaliente (1 página exacta en Word y PDF, en inglés y español) |
| **Entrega** | Comando único para correr código y tests, README con 4 temas, ADR, historial de commits legible | **Cumple (con nota de rama)** | Pendiente solo el merge final `dev → main` en los repos de código |
| **Plus opcional — Front** | Pantalla en Angular sin texto cortado, sin controles tapados, imágenes uniformes y prevención a nivel de componente | **Cumple y excede (100%)** | Sobresaliente (flujo completo + 209 tests en Chromium real) |

---

### 2.2. Condiciones Generales y Contexto

| Lo que pide el PDF | Qué se hizo en el proyecto | Evidencia en el repositorio | ¿Cumple? |
|--------------------|----------------------------|-----------------------------|----------|
| **Ventana de 5 días** | El proyecto inició el `2026-10-13`, cerró el alcance obligatorio (`T-16`) el `2026-10-15` (3 días de trabajo) y completó las extensiones (`T-17`, `T-19`, `T-20`) el `2026-10-17` (5.º día). Se midió y documentó el tiempo exacto. | `handoff/HANDOFF.md` §3 (línea 59), `handoff/progress.svg` | **Sí** |
| **Lenguaje: Go, Java (Spring Boot / WebFlux) o NestJS** | Se eligió **Java 21 con Spring Boot (stack servlet)** (`DEC-01`). Se justificó por qué se descartó WebFlux (complica la transacción bloqueante única de A2 sin beneficio para este alcance) y por qué Java sobre Go/NestJS (`BigDecimal` nativo en el JDK). | `spec/plan.md` §1 (`DEC-01`) | **Sí** |
| **Multi-país (Colombia, Ecuador, Guatemala, Perú) y varias marcas (multi-tenant)** | El modelo soporta múltiples países y marcas mediante `tenants (id, country_code, brand)`. Están precargados los **4 países mencionados en el enunciado**: `co-alpha` (Colombia, `COP`), `ec-alpha` (Ecuador, `USD`), `gt-alpha` (Guatemala, `GTQ`) y `pe-alpha` (Perú, `PEN`). | `spec/SPEC.md` §5, `spec/data-model.md` §1 | **Sí** |

---

### 2.3. Parte A1 — Motor de Cálculo del Pedido

#### A. Requisitos Funcionales de A1
1. **Endpoint (o caso de uso) que reciba el carrito y devuelva el desglose por línea y totales (subtotal bruto, descuentos con su origen, obsequios con cantidad, base gravable, impuestos y total):**
   - **Cómo lo cumple:** Expone `POST /api/v1/quotes` (`E-01`) y `GET /api/v1/quotes/{quoteId}` (`E-02`). Devuelve `lines[]` con `sku`, `description`, `qty`, `isGift`, `origin` (`GIFT:<id>`), `unitPrice`, `gross`, `discounts[{origin, amount}]`, `comboAllocations[{comboId, amount}]`, `net`, `referenceValue`, `taxableBase`, `taxRate`, `tax`; y `totals` con `grossSubtotal`, `discounts[{origin, amount}]`, `gifts[{sku, qty, origin}]`, `taxableBase`, `taxes`, `total`.
   - **Evidencia:** `spec/SPEC.md` §8 (líneas 327–335) y `spec/api-contract.md` (`E-01`).
2. **Coexistencia de las 5 palancas, orden de aplicación definido y justificación de por qué es el correcto:**
   - **Cómo lo cumple:** Define un pipeline de 8 pasos (`BR-01`) tras normalizar el carrito (`BR-00`):
     1. **Elegibilidad de Obsequios (`GIFT`):** Sobre cantidades pagadas y subtotal bruto antes de descuentos, porque el obsequio se gana por lo que el cliente compra y no cambia el precio pagado.
     2. **Combos (`COMBO`):** Consumen unidades primero porque son un precio negociado por paquete; esas unidades no pueden recibir además descuento por escala (*no double-dipping*). Si un combo no mejora el precio de lista, no se aplica ni consume unidades (`BR-03`).
     3. **Descuentos por Escala (`TIER`):** Tramos marginales (`BR-02`) sobre las unidades pagadas no consumidas por ningún combo. Una regla por SKU excluye ese SKU de cualquier regla por familia (`A-02`).
     4. **Neto por línea (`line.net`):** `gross - descuentos de escala - asignación de combo`.
     5. **Base gravable (`taxableBase`):** Después de descuentos comerciales; en obsequios sigue la política del país (`0` si `EXEMPT`, o `referenceValue` si `TAXED`).
     6. **Impuesto por línea (`line.tax`):** `round(taxableBase * taxRate)` por cada SKU.
     7. **Total (`total`):** Suma de netos más impuestos de todas las líneas.
     8. **Evaluación de cupo de crédito (`BR-06`):** En la capa de aplicación sobre el `total` final.
   - **Evidencia:** `spec/SPEC.md` §3 (`BR-00` a `BR-06`) y `diagrams/05-pricing-pipeline.svg`.
3. **Indicar si el pedido cabe en el cupo disponible cuando paga a crédito:**
   - **Cómo lo cumple:** Devuelve `credit: { fits, available, shortfall }` cuando `paymentMethod = "CREDIT"`. Si el cliente no tiene cuenta de crédito → `422 CREDIT_NOT_ENABLED`.
   - **Evidencia:** `spec/SPEC.md` `BR-06` y `spec/api-contract.md` (`E-01`).

#### B. Requisitos No Funcionales de A1 ("El corazón del ejercicio")
1. **El total cotizado y el total confirmado deben ser idénticos (aunque cambien precios o palancas):**
   - **Cómo lo cumple (`G-1`, `SPEC §6`, `DEC-07`):** La cotización se guarda como **solo inserción (*insert-only*)** en `quotes`, `quote_lines` y `quote_line_adjustments` con vigencia `expires_at` (15 min). Al confirmar (`POST /api/v1/orders`), la tabla `orders` **no guarda ningún monto** ni vuelve a ejecutar el motor: solo apunta a `quote_id` y renderiza el desglose directamente desde las líneas selladas de la cotización.
2. **Nada de punto flotante para dinero; tipo, escala, regla y puntos de redondeo explícitos:**
   - **Cómo lo cumple (`G-2`, `SPEC §4`, `DEC-06`):** Usa `Money(BigDecimal, CurrencyPolicy)` (prohibido `float`/`double` con ArchUnit), `string` en JSON, `NUMERIC(19,4)` en BD, escala y `RoundingMode` (`HALF_UP`) por país desde BD, y redondeo **únicamente por línea** en `RP-2` (descuentos de línea y prorrateo de combo con *largest remainder*) y `RP-4` (impuesto por línea). En `RP-5`, los totales del pedido son sumas exactas de líneas ya redondeadas y nunca se re-redondean.
3. **Multi-país: moneda, escala decimal y tasas no quemadas en la lógica:**
   - **Cómo lo cumple (`P-07`, `SPEC §5`, `T-20`):** Todo está modelado como datos por país/tenant (`currencies`, `countries`, `products.tax_rate`). En `T-20` se agregaron Guatemala (`GTQ`) y Perú (`PEN`) únicamente con un *changeset* de Liquibase, sin tocar código Java.

#### C. Los 6 Golden Tests Obligatorios de A1

| # en PDF | Caso exigido por el enunciado | Test en el proyecto | Qué comprueba exactamente |
|----------|-------------------------------|---------------------|---------------------------|
| **1** | Un pedido con descuento en dos tramos | `GT-01` (`GoldenPricingTest#gt01`) | 25 unidades de `BEV-COLA-350` a `2,500 COP`: unidades 1–9 al 0%, 10–19 al 5% (`1,250`), 20–25 al 10% (`1,500`) → descuento `2,750`, base `59,750`, IVA 19% redondeado `11,353`, total `71,103`. |
| **2** | Un pedido con combo donde los productos que activan el combo no deben aparecer como un descuento suelto | `GT-02` (`GoldenPricingTest#gt02`) | Aunque los SKUs del combo tienen una regla de descuento por escala activa en el catálogo, las unidades consumidas por el combo producen una única entrada `COMBO:<id>` y **cero** entradas `TIER:*`. |
| **3** | Un pedido con obsequio: el producto gratis aparece con su cantidad en el desglose | `GT-03` (`GoldenPricingTest#gt03`) | El regalo aparece como línea separada (`isGift: true`, `origin: GIFT:<id>`, `qty`, `unitPrice: 0`, `net: 0`) y en `totals.gifts[]`, sin mezclarse con líneas pagadas. |
| **4** | Un combo con impuestos: verifica que el impuesto entra en el total | `GT-04` (`GoldenPricingTest#gt04`) | Combo de gaseosa (IVA 19%) + papas (IVA 5%): reparte el descuento de `3,600` (`2,647` y `953` por *largest remainder*), calcula el IVA sobre la base reducida (`1,397 + 132 = 1,529`) y verifica el total `11,529`. |
| **5** | Un pedido a crédito que excede el cupo | `GT-05` (`GoldenQuoteTest#gt05` + `CreditLimitIT`) | En cotización devuelve `fits: false`, `available` y `shortfall`. En confirmación (`CreditLimitIT`) responde `409 CREDIT_LIMIT_EXCEEDED` haciendo rollback sin crear pedido ni movimiento en `credit_ledger`. |
| **6** | Caso de regresión de la cotización: mismo carrito, cotizo y confirmo, los dos totales coinciden | `GT-06` (`QuoteConfirmRegressionIT`) | Se crea la cotización; antes de confirmar se cambia el precio del producto y se desactiva una palanca en BD; al confirmar, el total confirmado coincide exactamente con el cotizado, y una nueva cotización del mismo carrito da un total diferente. |

---

### 2.4. Parte A2 — Confirmación, Idempotencia y Consistencia

| Requisito del PDF (A2) | Solución implementada y documentada | Pruebas que lo demuestran | ¿Cumple? |
|------------------------|-------------------------------------|---------------------------|----------|
| **`POST /orders` acepta una clave de idempotencia; reintentos no duplican pedidos ni consumen cupo dos veces** | Exige cabecera `Idempotency-Key`. Dentro de la transacción ejecuta `INSERT INTO idempotency_keys ... ON CONFLICT DO NOTHING`. Si la clave ya se completó con el mismo `request_hash` (SHA-256), devuelve el `response_body` guardado byte por byte con `Idempotent-Replayed: true`. Si cambia el body con la misma clave → `422 IDEMPOTENCY_KEY_REUSED`. Si el pedido falla, hace rollback completo (incluyendo la clave) para que el cliente pueda reintentar (`BD-02`). Además, `orders.quote_id` es `UNIQUE` y `credit_accounts` se actualiza con `WHERE consumed + :total <= credit_limit`. | `IdempotencyContractIT`, `IdempotencyReplayIT`, `ConfirmOrderConcurrencyIT`, `CreditLimitIT` (`spec/SPEC.md` §7.1–§7.3) | **Sí** |
| **Si la respuesta es `201` con número de orden, la orden existe y es consultable (definir qué garantiza esa invariante)** | **Invariante `I-201`:** 1) La orden se escribe síncronamente en la transacción de la petición; 2) `@Transactional` vive en el caso de uso separado del controlador (verificado con ArchUnit para impedir *self-invocation*), por lo que el `COMMIT` en PostgreSQL termina **antes** de que el controlador serialice y envíe el `201`; 3) `GET /orders/{id}` y el historial leen de la tabla primaria bajo `READ COMMITTED`. | `ConfirmOrderCommitOrderingIT`, `OrderReadYourWritesIT`, `ConfirmOrderFailureInjectionIT`, `TransactionBoundaryArchTest` (`spec/SPEC.md` §7.2 y §7.6) | **Sí** |
| **Efectos hacia afuera (Push y ERP): cómo se garantiza que no se pierdan ni se dupliquen, y qué pasa si el sistema externo está caído** | **Nunca se pierden:** En la misma transacción ACID del pedido se insertan 2 filas `PENDING` en `outbox_events` (`PUSH` y `ERP`). Un `OutboxRelay` reclama eventos con *lease* (`FOR UPDATE SKIP LOCKED`, `locked_until`), cierra la transacción corta y llama al exterior **fuera de cualquier transacción**. Si el proceso cae antes de marcar `SENT`, el *lease* expira y se reenvía.<br>**Nunca se duplican:** Cada evento lleva su UUID `event_id`; Push lo usa como *collapse id* y el ERP hace *upsert* por número de orden.<br>**Si está caído:** El pedido queda confirmado (`201`), el evento se reintenta con *exponential backoff + jitter* (hasta 8 intentos antes de pasar a `DEAD` y alertar en `outbox_dead`), y se entrega cuando el sistema externo se recupera. | `OutboxWriteIT`, `OutboxRelayIT#outageRecovery`, `OutboxRelayIT#leaseExpiry`, `OutboxRelayIT#dead` (`spec/SPEC.md` §7.4) | **Sí** |
| **Documentar el modelo de consistencia elegido y qué se sacrifica** | **Consistencia fuerte (CP, una transacción ACID en PostgreSQL)** para pedido, crédito, llave de idempotencia y escritura del outbox. **Qué se sacrifica:** Disponibilidad de escritura si cae la base de datos primaria, y serialización de confirmaciones concurrentes de un mismo cliente sobre su fila en `credit_accounts` (mitigado con `lock_timeout` y `409`).<br>**Consistencia eventual (*at-least-once*)** para Push y ERP. **Qué se sacrifica:** Latencia de propagación hacia sistemas externos (intervalo de *polling* de `1s` + reintentos). | `spec/SPEC.md` §7.5 y `ADR-0001` | **Sí** |

---

### 2.5. Parte A3 — ADR (Máximo 1 Página), Entregables y Plus Opcional (Front)
- **ADR (`deliverables/adr/0001-order-pricing-and-confirmation.es.pdf` y `.pdf`):** Cumple exactamente **1 página A4** ($\le 500$ palabras) con las 4 secciones exigidas: *Decisiones y alternativas descartadas*, *No implementado, a propósito*, *Qué revisaría en un code review* y *Riesgo y mitigación*.
- **Entregables:** Comando único (`./mvnw verify`), README con los 4 temas obligatorios validados por `check-docs.mjs`, ADR y commits legibles bajo Conventional Commits.
- **Plus Opcional · Front (Angular):** Resuelve los 3 defectos en la pantalla de resumen (y en todo el flujo extendido) mediante componentes dedicados probados en Chromium real (`768×1024` y `375×812`):
  1. `ui-text` → ningún texto se corta.
  2. `ui-action-bar` → ningún control queda tapado por la barra del sistema ni el teclado virtual.
  3. `ui-product-image` → todas las imágenes del grid escalan con el mismo `aspect-ratio`.

---

## Parte 3: Errores, Incongruencias y Desfases Detectados en la Auditoría

Al auditar la consistencia interna de los documentos del repositorio, se encontraron estos **5 puntos**:

### 3.1. Riesgo crítico de entrega: desfase entre `main` de `docs` y `main` de los repositorios de código
- **Ubicación:** `handoff/HANDOFF.md` §3 (línea 45) y §11 (líneas 189–195) frente a `governance/branches-and-environments.md` (líneas 25 y 60–64).
- **Detalle:** En `orderflow-engine-docs` todo entra directo a `main`, por lo que este repositorio ya documenta como terminadas (`done`) las tareas **`T-17` (cliente web y endpoint `E-07`), `T-19` (tope de cantidades y catálogo en español) y `T-20` (semillas de Guatemala y Perú)**. Sin embargo, `HANDOFF.md` indica que en los repositorios de código (`api`, `web`, `infra`, `tools`) esos cambios **están en `dev` y aún no se han fusionado a `main`** (*"Phase closing: Not yet, on the owner's order"*).
- **Impacto:** Si un evaluador clona la rama por defecto (`main`) de los repositorios de código antes de ejecutar el merge `dev → main`, encontrará el código en el estado de `T-16` (sin cliente web, sin `GET /api/v1/products` y con solo 2 países en lugar de 4).

### 3.2. Contradicción de diseño sobre `products.name` en cotizaciones selladas y replays idempotentes
- **Ubicación:** `spec/data-model.md` §4 (línea 72) y §6 (línea 97) frente a `spec/plan.md` §3 (línea 69) y `spec/SPEC.md` §7.3 (línea 263).
- **Detalle:**
  1. En `spec/data-model.md` (línea 97) se define que `quote_lines` no captura el nombre del producto y que `description` se lee en vivo desde `products.name` (*"current name, not captured"*).
  2. En cambio, en `spec/plan.md` (línea 69) se afirma lo contrario: *"A quote line keeps the description it was sealed with, so a confirmed order never changes"*.
  3. Además, cuando se confirma un pedido (`POST /api/v1/orders`), `idempotency_keys.response_body` guarda el JSON completo del `201` (incluyendo `description`). Si cambia `products.name`, un replay idempotente devuelve el nombre antiguo almacenado en `response_body`, mientras que `GET /api/v1/orders/{orderId}` devuelve el nombre nuevo.

### 3.3. Tareas dueñas corridas ("off-by-one") en el registro de riesgos de `plan.md`
- **Ubicación:** `spec/plan.md` §4 Risk register (líneas 75–79) frente a `spec/TASKS.md`.
- **Detalle:** Tres filas apuntan a la tarea siguiente a la que realmente implementa la mitigación:
  - **`RISK-01`** (*Contention on a customer's credit row... Measured in `ConfirmOrderConcurrencyIT`*) figura con tarea **`T-13`**, pero en `spec/TASKS.md` (línea 188) `ConfirmOrderConcurrencyIT` pertenece a **`T-12`** (`T-13` es *Order history*).
  - **`RISK-02`** (*The outbox grows while the ERP is down — Backoff, `DEAD` after max attempts, `outbox_pending` gauge*) figura con tarea **`T-15`**, pero se implementa en **`T-14` (*Outbox relay*)** (`T-15` es *Retention housekeeping*).
  - **`RISK-05`** (*A downstream consumer does not deduplicate by `event_id`*) también figura con tarea **`T-15`**, cuando pertenece a **`T-14`**.

### 3.4. Estados, textos y conteos desactualizados tras agregar `T-17`, `T-19` y `T-20`
1. **Estado `planned` / `planeado` en `README.md` y `README.es.md` (líneas 65–66):** `README-WEB` y `README-INFRA` siguen con estado `planned` / `planeado`, aunque sus tareas ya están marcadas como `done` en `handoff/HANDOFF.md`.
2. **"Both seeded countries" en lugar de 4 países en `spec/SPEC.md` §14.3 (línea 651):** La fila de *Store picker* sigue diciendo *"Both seeded countries show in the UI (COP scale 0, USD scale 2)"*, texto anterior a `T-20`, cuando ya existen **4 países** (`CO`, `EC`, `GT`, `PE`).
3. **Omisión de `T-20` y conteo de PRs en `handoff/HANDOFF.md` §3 (líneas 45 y 48):** Las filas *"Current task"* y *"Tasks done"* mencionan solo *"T-17 and T-19"* omitiendo `T-20`, y dicen *"14 task pull requests, §11"* cuando la tabla de §11 suma **18 pull requests** en total (14 en repos de código + 4 en `docs`).
4. **Conteo de ACs fuera del enunciado en `handoff/HANDOFF.md` §3 (línea 46):** Dice *"10 ACs beyond the assignment"*, pero en `spec/SPEC.md` §14.3 se listan **11 ACs propios** (`AC-13`, `AC-14`, `AC-18`, `AC-47`, `AC-48`, `AC-49`, `AC-50`, `AC-51`, `AC-52`, `AC-53`, además de la extensión de `AC-42…AC-46`).

### 3.5. Matiz en el texto del ADR-0001 frente a `E-07`
- **Ubicación:** `deliverables/adr/0001-order-pricing-and-confirmation.es.pdf` y `.pdf` (sección *"No implementado, a propósito"*).
- **Detalle:** El ADR (cerrado en `T-16`) enumera *"catálogo"* dentro de lo no implementado, pero en `T-17` se agregó `GET /api/v1/products` (`E-07`, catálogo de solo lectura). En `spec/SPEC.md` §1 se precisa como *"Catalog and lever administration"*, pero en el ADR quedó la palabra *"catálogo"* a secas.

---

## Parte 4: Las 24 Trampas Técnicas Explicadas de Manera Clara

### 4.1. Las 15 Trampas Técnicas Registradas en `handoff/HANDOFF.md` §7 (`TR-01` a `TR-15`)

1. **`TR-01` — `java.util.Currency` dice que el Peso Colombiano (`COP`) tiene 2 decimales**
   - **La trampa:** Si en Java pides `Currency.getInstance("COP").getDefaultFractionDigits()`, devuelve `2` (centavos), pero en Colombia los precios y facturas comerciales manejan **`0` decimales** (pesos enteros).
   - **Cómo se evita:** Nunca se consulta `java.util.Currency` para la escala decimal. La escala se lee siempre de la tabla `currencies`/`countries` en la base de datos (`COP = 0`, `USD/GTQ/PEN = 2`).

2. **`TR-02` — Prefijos de códigos parecidos que se confunden**
   - **La trampa:** Usar abreviaturas parecidas para Requisitos y Puntos de Redondeo hacía que las referencias cruzadas en los documentos y tests se confundieran.
   - **Cómo se evita:** Cada familia tiene un prefijo único e inconfundible (`REQ-` para requisitos, `RP-` para puntos de redondeo, `BR-` para reglas de negocio, `AC-` para criterios de aceptación, `GT-` para golden tests).

3. **`TR-03` — Una regla que no se verifica automáticamente se termina rompiendo**
   - **La trampa:** Escribir en un documento *"el dominio no debe usar `float`"* o *"todos los errores deben estar traducidos"* no sirve si alguien hace un cambio rápido y olvida la regla.
   - **Cómo se evita:** Toda regla crítica se convierte en un test automático que rompe el build si se incumple (`DomainPurityArchTest` con ArchUnit, `ErrorCatalogI18nTest` y `check-docs.mjs`).

4. **`TR-04` — *Scope creep* (agregar buenas ideas que el enunciado no pidió)**
   - **La trampa:** En una prueba de 5 días es fácil perder tiempo agregando login, administración de catálogo o cancelación de pedidos y no terminar lo obligatorio.
   - **Cómo se evita:** `spec/SPEC.md` §1 define una frontera cerrada de qué entra y qué queda fuera. Prohibido agregar nada sin declararlo y justificarlo antes ahí (`GC-9`).

5. **`TR-05` — Enlaces relativos que funcionan en tu máquina pero se rompen al evaluar**
   - **La trampa:** En la máquina de desarrollo las 6 carpetas (`api`, `web`, `docs`, etc.) están juntas, por lo que un enlace como `../orderflow-engine-docs/spec/SPEC.md` funciona localmente. Pero si el evaluador clona **solo** `orderflow-engine-api`, ese enlace queda roto (404).
   - **Cómo se evita:** Ningún enlace relativo puede salir de su propio repositorio. Los demás repositorios se mencionan por nombre, sin hipervínculo relativo.

6. **`TR-06` — GitHub borra la rama `dev` al cerrar una fase en cuentas gratuitas**
   - **La trampa:** GitHub bloquea los *rulesets* de protección de ramas en repositorios privados de cuentas gratuitas (HTTP 403). Si activas la opción *"Automatically delete head branches"* en el repositorio y haces un merge de cierre de fase (`dev → main`), GitHub interpreta que `dev` era una rama temporal y **borra la rama `dev`**.
   - **Cómo se evita:** No activar el borrado automático de ramas en GitHub mientras los repos sean privados; borrar únicamente las ramas de tarea con `gh pr merge --delete-branch` y dejar `dev` intacta al hacer merge hacia `main`.

7. **`TR-07` — En Windows los scripts `.sh` y `mvnw` pierden el permiso de ejecución**
   - **La trampa:** En Windows, Git tiene `core.filemode=false`. Cuando haces un `git add` normal de `mvnw` o `scripts/test-all.sh`, se guardan con permisos `100644` (no ejecutable). Cuando el evaluador los corre en Linux o macOS, fallan con `Permission denied`.
   - **Cómo se evita:** Hacer stage explícito con `git add --chmod=+x` y verificar con `git ls-files -s` que tengan el modo `100755`.

8. **`TR-08` — PIT (Mutation Testing) falla si aún no existen clases en el paquete objetivo**
   - **La trampa:** Al configurar el plugin de mutación PIT en el scaffold (`T-01`), antes de crear la primera clase del dominio de precios (`T-02`), correr `./mvnw -Pmutation verify` se detenía con el error *"No mutations found"*.
   - **Cómo se evita:** Se documentó esa condición en `T-01` hasta que `T-02` agregó la clase `Money` y el perfil empezó a mutar código real.

9. **`TR-09` — Problemas de CORS por servir el Front y la API en puertos distintos**
   - **La trampa:** Si el navegador carga Angular desde `localhost:4200` (o `:8081`) y llama directo a la API en `localhost:8080`, el navegador bloquea las peticiones por ser *cross-origin* (CORS), obligando a meter configuración de CORS en el backend.
   - **Cómo se evita:** El cliente web solo hace llamadas a rutas relativas (`/api/v1/...`), y el contenedor `nginx` del propio front (o el proxy de `ng serve`) redirige `/api/` hacia la API. Para el navegador todo es un mismo origen (*one origin*) y la API no necesita CORS.

10. **`TR-10` — Subdividir tareas como `T-17a` rompe los contadores y gráficas automáticas**
    - **La trampa:** Las herramientas de validación (`orderflow-engine-tools`) buscan identificadores con el formato exacto `T-NN`. Si titulas un commit o una fila de progreso con `T-17a`, queda fuera de los conteos, de la gráfica `progress.svg` y de las referencias cruzadas sin avisar.
    - **Cómo se evita:** Aunque una tarea grande se divida en varios Pull Requests temáticos, todos los commits terminan en `(T-17)` y en la tabla de estado existe una sola fila `T-17`.

11. **`TR-11` — Los tests en `jsdom` dan "falso positivo" al probar que el texto no se corta**
    - **La trampa:** El enunciado pide probar que ningún nombre largo se corte en pantalla mediana (`768px`). Si ejecutas los tests de Angular en `jsdom`, no hay motor de renderizado visual y todos los elementos reportan `width = 0`, por lo que el test siempre pasa aunque el texto se desborde en la vida real.
    - **Cómo se evita:** Ejecutar los tests de interfaz dentro de un navegador real (**headless Chromium** mediante Playwright en el contenedor de pruebas).

12. **`TR-12` — `nginx` se apaga al arrancar si el nombre del host de la API aún no resuelve**
    - **La trampa:** Cuando `nginx` arranca, intenta resolver el DNS del `proxy_pass` (`http://api:8080` o `host.docker.internal`). Si el contenedor de la API no existe todavía o si en Linux `host.docker.internal` no está mapeado, `nginx` muere inmediatamente al iniciar.
    - **Cómo se evita:** En el `compose.yaml` completo, el servicio `web` declara `depends_on: api`; y cuando el web corre solo, mapea `extra_hosts: host.docker.internal:host-gateway` para que funcione también en Linux.

13. **`TR-13` — Angular 22 exige una versión de Node más reciente que la de muchas máquinas**
    - **La trampa:** Angular 22 requiere Node `>= 22.22.3` o `>= 24.15`. Si el evaluador tiene una versión anterior en su máquina host, `npm test` falla antes de empezar.
    - **Cómo se evita:** Empaquetar la ejecución de los tests web dentro del `Dockerfile` (`docker build --target test .`), que trae su propio Node y Chromium, de modo que el host solo necesita Docker.

14. **`TR-14` — Falla esporádica de Testcontainers bajo carga pesada en paralelo**
    - **La trampa:** Cuando corren muchas pruebas en paralelo en una máquina cargada, Testcontainers puede tardar más de la cuenta en levantar PostgreSQL y lanzar `ContainerLaunchException`, pareciendo un fallo del código cuando en realidad fue un timeout de arranque de Docker.
    - **Cómo se evita:** Distinguir `ContainerLaunchException` (infraestructura lenta al arrancar el contenedor) de un fallo de aserción (`AssertionError`) y reejecutar en un host sin sobrecarga.

15. **`TR-15` — La caché de Docker puede fingir que los tests web corrieron cuando no lo hicieron**
    - **La trampa:** Como los tests web corren en la etapa `--target test` de `docker build`, si no cambió ningún archivo en `orderflow-engine-web`, Docker devuelve `CACHED` y muestra `OK` en milisegundos sin haber vuelto a ejecutar los 209 tests.
    - **Cómo se evita:** Usar `docker build --no-cache-filter test --target test .` cuando se necesita evidencia fresca de que todas las pruebas se ejecutaron realmente.

---

### 4.2. Las 9 Trampas de Negocio y Concurrencia en `spec/TASKS.md` (`RF-1` a `RF-9`)

1. **`RF-1` — Redondear por cada tramo en vez de una vez por línea:** En descuentos escalonados (ej. unidades 10–19 al 5% y 20–25 al 10%), si redondeas cada tramo por separado y luego sumas, acumulas error de redondeo. Se debe sumar el descuento exacto de todos los tramos de la línea y **redondear una sola vez al final de la línea**.
2. **`RF-2` — Doble descuento entre Combos y Escalas (y combos que encarecen):** Las unidades que entran en un combo no pueden contar ni recibir descuento por tramos (`TIER`). Además, si el precio configurado del combo es mayor o igual al precio de lista de los productos (`comboPrice >= listValue`), el combo **no debe aplicarse ni consumir unidades**.
3. **`RF-3` — Descuadre de centavos al repartir el descuento de un combo entre líneas con distinto IVA:** Al prorratear el descuento de un combo entre varios productos (ej. gaseosa al 19% y papas al 5%), truncar o redondear cada línea por separado hace que la suma de las partes no sea igual al descuento total del combo. Se resuelve con el **algoritmo del mayor resto (*largest remainder*)**, desempatando por orden alfabético de SKU.
4. **`RF-4` — Impuesto sobre obsequios según el país:** Un producto gratis (`GIFT`) tiene precio `0` y neto `0`, pero si el país tiene política `TAXED`, el impuesto se calcula sobre el **valor de referencia** (`precio de lista * cantidad regalada`) y se suma al total a pagar del pedido.
5. **`RF-5` — Re-redondear los totales del pedido:** Si redondeas cada línea y al final vuelves a redondear la suma total, la suma de las líneas de la factura electrónica puede no coincidir con el total. Los totales del pedido son **sumas exactas de líneas ya redondeadas** (`RP-5`).
6. **`RF-6` — *Deadlocks* y sobregiro de cupo bajo concurrencia:** Si dos peticiones simultáneas confirman pedidos a crédito del mismo cliente, pueden dejar el cupo en negativo o causar un *deadlock*. Se evita tomando los bloqueos siempre en el orden estricto **`idempotency_key → quote → credit_account`** y descontando el cupo con un `UPDATE ... WHERE consumed + :total <= credit_limit`.
7. **`RF-7` — Responder `201` antes del `COMMIT` o guardar errores en la llave de idempotencia:** Si serializas el `201` dentro de la transacción y el `COMMIT` falla, el cliente recibe un número de orden fantasma (`I-201`). Y si guardas un error (ej. `409 Cupo insuficiente`) asociado al `Idempotency-Key`, el cliente no podrá reintentar con la misma llave tras liberar cupo; por eso **los fallos hacen rollback completo y nunca se cachean**.
8. **`RF-8` — Llamar al ERP o al servicio de Push dentro de la transacción de base de datos:** Si haces una llamada HTTP externa dentro de `@Transactional`, mantienes bloqueadas las filas de la base de datos durante lo que tarde la red externa. Por eso la transacción solo inserta en `outbox_events`, hace `COMMIT`, y el `OutboxRelay` llama al exterior **fuera de cualquier transacción**.
9. **`RF-9` — Calcular dinero en el Frontend:** En JavaScript, `0.1 + 0.2 = 0.30000000000000004`. Por eso el frontend **tiene prohibido sumar o multiplicar precios** (ni siquiera calcula el subtotal del carrito): todos los montos viajan como `string` desde la API y el navegador solo los formatea visualmente.
