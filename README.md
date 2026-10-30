# Laboratorio 06 · Testing ☕✅

[![CI](https://github.com/gabrielo100472219/frontend_lab6/actions/workflows/ci.yml/badge.svg)](https://github.com/gabrielo100472219/frontend_lab6/actions/workflows/ci.yml)

Tests con Vitest y Testing Library para un trozo del catálogo de Tueste (`src/catalog`). El código de `src/catalog` es el del enunciado y no se ha cambiado (salvo durante los 💥, que se deshicieron). Lo que se ha añadido son los `*.spec.*`, más el hook de P3, el provider de P4 y los cupones de D1.

```
config/test/        config.ts (Vitest), config.d.ts (tipos globales), setup.ts (jest-dom)
vitest.config.ts    reexporta config/test/config.ts para que funcione `npx vitest run` sin -c
src/catalog/        código del enunciado + sus tests
src/mocks/          servidor MSW (D2)
tueste/             proyecto del laboratorio 4 con tests del formulario (P5)
.github/workflows/  CI (D3)
```

## Cómo ejecutar los tests

```bash
npm install

npm test                # modo vigilancia: al guardar un fichero se vuelven a ejecutar
npm run test:run        # una sola vez (vitest run -c ./config/test/config.ts)
npx vitest run          # igual que el anterior: usa vitest.config.ts
npm run test:coverage   # una vez, con informe de cobertura en coverage/ (P1)
npm run type-check      # tsc --noEmit

# P5: formulario del laboratorio 4
cd tueste && npm install && npm run test:run
```

> Nota: Vitest desactiva el modo vigilancia cuando no hay terminal interactiva (en CI, o desde un agente de IA, que define `AI_AGENT`). Desde una terminal normal, `npm test` se queda escuchando: lo comprobamos editando un spec y viendo que se volvía a ejecutar solo y que mostraba `Tests failed. Watching for file changes...`.

## Salida final de `npx vitest run`

```
 RUN  v5.0.5 frontend_lab6
 ✓ src/catalog/cart.spec.ts (14 tests) 8ms
 ✓ src/catalog/coffee.api.spec.ts (6 tests) 11ms
 ✓ src/catalog/use-cart.spec.ts (5 tests) 20ms
 ✓ src/catalog/use-offer-countdown.spec.ts (5 tests) 24ms
 ✓ src/catalog/cart-context.spec.tsx (4 tests) 24ms
 ✓ src/catalog/coffee.api.msw.spec.ts (6 tests) 43ms
 ✓ src/catalog/coffee-card.spec.tsx (5 tests) 109ms
 ✓ src/catalog/coffee-catalog.msw.spec.tsx (3 tests) 147ms
 ✓ src/catalog/coffee-catalog.spec.tsx (6 tests) 215ms
 ✓ src/catalog/coupon.spec.ts (13 tests) 3ms
 Test Files  10 passed (10)
      Tests  67 passed (67)
   Start at  23:42:01
   Duration  1.75s (environment 77%, setup 11%, tests 5%, import 3%, worker 3%, transform 1%)
```

Y en `tueste/` (P5):

```
 RUN  v5.0.5 frontend_lab6/tueste
 ✓ src/pods/edicion/edicion.component.spec.tsx (3 tests) 280ms
 Test Files  1 passed (1)
      Tests  3 passed (3)
```

`npm run type-check` no muestra nada (sin errores).

## 💥 Tabla de código roto

Cada cambio se hizo sobre el código, se ejecutaron los tests y se deshizo el cambio.

| # | Qué cambiamos | Qué test se puso en rojo |
|---|---|---|
| O2 | `addToCart`: `{ ...item, quantity: item.quantity + 1 }` → `((item.quantity += 1), item)` | `addToCart > no debería modificar el carrito que recibe cuando el café ya está en él` (el resto sigue en verde: el resultado es correcto, pero muta) |
| O2 | `finalPrice`: `coffee.price` a secas | `finalPrice > debería aplicar el descuento cuando el café tiene descuento` y `cartTotal > debería sumar precio final por cantidad cuando hay 2 × Etiopía y 1 × Brasil` |
| O3 | `case 503:` → `case 502:` | `debería rechazar con "Servicio no disponible" cuando la API responde 503` |
| O3 🪤 | Test del 503 con `try/catch` y el mock devolviendo **200** | **Ninguno**: el test sigue en verde. Con `expect.assertions(1)` al principio: rojo, `expected number of assertions to be 1, but got 0`. La versión con `rejects` y un 200: rojos los 3 casos del `it.each` |
| O4 | `onAdd(coffee)` → `onAdd({ ...coffee, price: 0 })` | `debería llamar a onAdd una vez y con ese café cuando se pulsa el botón` |
| O5 | Quitar `.toLowerCase()` de `c.name` | `debería dejar sólo Brasil Cerrado cuando se busca "bra"` (y, después de añadirlo, también `no debería distinguir mayúsculas cuando se busca "BRA"`) |
| O5 🤔 | Quitar `.toLowerCase()` de `filter` | Al principio **ninguno** (ver respuesta de O5). Añadimos `no debería distinguir mayúsculas cuando se busca "BRA"`, que ahora se pone en rojo |
| O5 | Quitar `disabled={units === 0}` | `debería sumar bolsas y precio al añadir cafés y vaciarlos con "Vaciar carrito"` |
| O6 | `add` con `setCart(addToCart(cart, coffee.id))` | `debería tener 2 unidades cuando se añaden dos cafés dentro del mismo act` (sólo el caso 4) |
| P1 | `remove` con `setCart([])` | `debería quitar sólo el café indicado cuando se llama a remove` |
| P2 | El 💥 de O4 | El snapshot **no** lo detecta: sólo falla el test de `onAdd` |
| P2 | Texto del botón `Añadir {coffee.name} al carrito` → `Añadir al carrito` | El snapshot, el test de `onAdd` de la tarjeta (no encuentra el botón por nombre) y el de integración del catálogo |
| P3 | Quitar `return () => clearInterval(interval)` | `debería llamar a clearInterval al desmontar` |
| P3 | `Math.max(current - 1, 0)` → `current - 1` | `debería quedarse en 0 con finished: true cuando pasan más segundos de los indicados` |
| P4 | Quitar el `throw` de `useCartContext` | `debería lanzar un error cuando se usa sin el provider` |
| P5 | Esquema: `min(2, …)` → `min(1, …)` en el nombre | `debería mostrar el error del nombre y no llamar a onSave cuando el nombre tiene un carácter` |
| P5 | El precio se lee mal del input (`Number(value.replace(".", ""))` en vez de `valueAsNumber`) | `debería llamar a onSave con los valores del formulario cuando los datos son válidos` (llega 125 en vez de 12.5) |
| P5 | `onSave({ ...value, notes: "" })` | `debería llamar a onSave con los valores del formulario cuando los datos son válidos` |
| D1 | Quitar `.trim()` del código | Los 3 casos con espacios (`" cafe10 "`, `"  CaFe10  "`, `" envio "`) |
| D1 | Quitar el `Math.max(…, 0)` de `ENVIO` | `debería dejar el total en 0 cuando "ENVIO" se aplica a 2 €` |
| D2 | Handler de MSW en `/api/cafes` en vez de `/api/coffees` | `debería devolver los cafés cuando el servidor responde 200` (`onUnhandledFrame: 'error'` hace fallar la petición no prevista) |
| D3 | PR [#1](https://github.com/gabrielo100472219/frontend_lab6/pull/1): `formatPrice` con coma decimal | CI en rojo: 7 tests (2 de `formatPrice`, 3 de `CoffeeCard` con el snapshot, y los dos de integración del carrito) |

## 📝 Respuestas

### O1 · Configurar Vitest

**¿Para qué sirve `environment: 'jsdom'`? ¿Qué pasaba en la demo 05 sin él?**
Vitest ejecuta los tests en Node, y Node no tiene navegador: no existen `document`, `window` ni el DOM. jsdom es una implementación del DOM en JavaScript que Vitest instala como entorno global, de modo que `render` de Testing Library puede crear nodos, montar el componente y consultarlos. Sin él, los tests de componentes no llegan ni a renderizar. Lo comprobamos ejecutando `coffee-card.spec.tsx` con `--environment node`: los 4 tests fallan con `ReferenceError: document is not defined`.

**¿Qué hace `restoreMocks: true` y qué problema evita entre un test y el siguiente?**
Antes de cada test restaura los spies creados con `vi.spyOn`: se deshace el mock y el objeto espiado vuelve a tener su implementación original. Así un mock no "se escapa" al test siguiente. Lo probamos con dos tests: el primero espía `fetch` y devuelve un 503, y el segundo no mockea nada y espera el `TypeError` del `fetch` real. Con `restoreMocks: true` pasan los dos. Con `false`, el segundo recibe el 503 del primero y falla. Es lo que permite cumplir la regla de que "un test no depende de otro": el resultado ya no depende del orden en que se ejecuten.

### O2 · Funciones puras

**¿Por qué las funciones puras son las más fáciles de probar? ¿Qué habéis tenido que preparar en el Arrange?**
Porque su resultado depende sólo de los argumentos y no tienen efectos secundarios: no hay red, ni tiempo, ni DOM, ni estado global que preparar o limpiar. El test es "dados estos datos, devuelve esto", y se puede repetir en cualquier orden con el mismo resultado. En el Arrange sólo preparamos datos: un café de `test-data.ts` (a veces con `{ ...colombia, discount: 0 }`), un carrito como array literal y, para comprobar que no muta, una copia con `structuredClone(cart)` para compararla después. Ningún mock.

### O3 · Código asíncrono

**¿Por qué no queremos que los tests llamen a la API de verdad?**
1. **Determinismo**: el servidor puede estar caído, lento o devolver datos que cambian. El test fallaría por motivos que no tienen nada que ver con nuestro código.
2. **Poder probar los casos raros**: provocar un 404, un 503 o un fallo de red en un servidor real es difícil. Con el spy decidimos la respuesta en una línea.
3. **Velocidad y aislamiento**: sin red, los 6 tests tardan unos 11 ms y se pueden ejecutar en CI sin levantar ningún servidor. Además no se tocan datos reales: un test de un POST no crearía nada de verdad.
4. **Qué probamos**: queremos probar nuestro `getCoffees` (la URL, la cabecera y cómo traduce los estados a errores), no el backend.

**¿Qué pasaba en el test del `try/catch` y qué hace `expect.assertions(1)`?**
Con el mock devolviendo un 200, `getCoffees()` no lanza, así que no se entra en el `catch` y el `expect` de dentro no se ejecuta nunca. Un test sin ningún `expect` que falle cuenta como verde: pasaba aunque el código ya no fallase. `expect.assertions(1)` le dice a Vitest "al final de este test tiene que haberse ejecutado exactamente 1 aserción"; si no, el test falla (`expected number of assertions to be 1, but got 0`). Nos quedamos con `await expect(getCoffees()).rejects.toThrow('…')`, que falla por sí sola si la promesa se resuelve.

### O4 · Componente presentacional

**¿Por qué es mejor `getByRole('button', { name: 'Añadir Colombia Huila al carrito' })` que "el primer button de la tarjeta"? ¿Qué tiene que ver con la accesibilidad?**
Porque busca el botón como lo encuentra una persona: por lo que es (un botón) y por lo que dice. "El primer button" depende de la estructura del HTML: si mañana se añade un botón de favoritos delante, el test pulsaría otro botón sin darse cuenta. El nombre accesible es además lo que lee un lector de pantalla. Si el test encuentra el botón por su rol y su nombre, una persona con lector de pantalla también puede encontrarlo. Si el botón fuera un `<div onClick>` o sólo tuviera un icono sin texto, `getByRole` fallaría, y ese fallo es un problema real de accesibilidad. En el 💥 de P2 se ve: con el texto genérico "Añadir al carrito", la consulta deja de encontrarlo, y con varias tarjetas tampoco habría forma de distinguirlos.

**¿Cuándo usáis `getBy…` y cuándo `queryBy…`?**
`getBy…` cuando el elemento **tiene que estar**: si no está, lanza un error con el DOM impreso, que es un mensaje de fallo muy claro. `queryBy…` cuando queremos comprobar que **no está**: devuelve `null` en lugar de lanzar, y lo usamos con `expect(…).not.toBeInTheDocument()`, como en "un café sin descuento no muestra etiqueta" o "Cargando… ha desaparecido". (Y `findBy…` cuando el elemento aparecerá más tarde, ver O5).

### O5 · Componente con datos

**¿Por qué aquí necesitáis `findBy…` (con `await`) y en O4 bastaba con `getBy…`?**
`CoffeeCard` recibe todo por props y pinta su contenido en el primer render, así que en cuanto termina `render` ya está en el DOM. `CoffeeCatalog` empieza en "Cargando…" y pide los cafés en un `useEffect`. Aunque el spy resuelva enseguida, la promesa termina en una microtarea posterior: `setCoffees` y `setLoading(false)` provocan otro render **después** de que `render` haya devuelto el control. `findBy…` devuelve una promesa que reintenta la consulta (hasta 1 s por defecto) hasta que el elemento aparece. Con `getBy…` justo después de `render` sólo veríamos "Cargando…".

**🤔 ¿Y si quitáis `.toLowerCase()` de `filter`? ¿Por qué no falla ningún test?**
Porque los tests sólo escribían texto en minúsculas ("bra", "zzz"): `"bra".toLowerCase()` es `"bra"`, así que quitarlo no cambia nada para esos datos. El código sólo se rompe cuando la persona escribe mayúsculas. Añadimos `no debería distinguir mayúsculas cuando se busca "BRA"`, que con el 💥 se pone en rojo.

**En el caso 4 no habéis mockeado ni el hook ni el carrito. ¿Qué ventaja tiene? ¿Y qué inconveniente?**
Ventaja: prueba lo que ve la persona usuaria con todas las piezas reales juntas (catálogo → tarjeta → `useCart` → `addToCart`/`cartTotal`/`finalPrice` → `formatPrice`). Detecta fallos de integración que los tests unitarios no ven, como pasar mal `onAdd` o un `disabled` olvidado, y no se rompe si refactorizamos por dentro. Inconveniente: cuando falla no dice *dónde* está el error. Por ejemplo, con el 💥 de `formatPrice` de la PR de D3 se pusieron en rojo a la vez tests de `cart`, de `CoffeeCard` y los dos de integración. Además es más lento (los 6 tests de `coffee-catalog.spec.tsx` tardan unos 215 ms, frente a los 8 ms de los 14 de `cart.spec.ts`) y necesita más preparación.

### O6 · Custom hook

**¿Para qué sirve `act`? ¿Qué pasaba en la demo 09 sin él?**
`act` agrupa todo lo que cambia el estado de React y, al terminar, aplica las actualizaciones pendientes y los efectos (vuelve a renderizar). Así, cuando hacemos el `expect`, `result.current` ya tiene el estado nuevo, igual que lo vería una persona después del clic. En la demo 09, `result.current.setCredential(newCredential)` sin `act` dejaba la actualización pendiente: el test fallaba porque `result.current.credential` seguía con el valor inicial, y React avisaba de que la actualización no estaba envuelta en `act(...)`. (Con `render` y `userEvent` no hace falta escribirlo porque Testing Library ya lo usa por dentro).

**Según el 💥: ¿por qué el caso 4 detecta el fallo y el caso 2 no?**
Con el 💥, `add` calcula el nuevo carrito con `cart`, el valor capturado en el render en el que se creó la función. En el **caso 2** hay dos `act` seguidos: al acabar el primero React vuelve a renderizar, `result.current.add` es una función nueva cuyo `cart` ya tiene a Brasil, y el segundo `add` parte de ahí. El resultado (2 unidades) es correcto. En el **caso 4** las dos llamadas están en el mismo `act`, sin render entre medias, y usan la misma función, así que las dos calculan `addToCart([], 3)` y la segunda sustituye a la primera: 1 unidad en vez de 2. Es la trampa de "sumar tres": con la función de actualización (`setCart(previous => …)`) cada llamada parte del estado más reciente, aunque no haya habido render.

## ⭐ Opcionales

### P1 · Cobertura

`npm run test:coverage` (con `@vitest/coverage-v8`). La primera ejecución daba 100 % de líneas y ramas, pero 92,59 % de funciones: `remove` de `useCart` no se llamaba nunca. Añadimos `debería quitar sólo el café indicado cuando se llama a remove`, y ahora todo está al 100 %:

```
Statements   : 100% ( 89/89 )
Branches     : 100% ( 26/26 )
Functions    : 100% ( 37/37 )
Lines        : 100% ( 74/74 )
```

**¿Por qué un 100 % de cobertura no significa que el código esté bien probado?** La cobertura mide qué líneas *se ejecutaron* durante los tests, no qué se *comprobó*. El 💥 de `filter.toLowerCase()` es el ejemplo perfecto: esa línea tenía cobertura completa desde el primer test del buscador, y sin embargo quitarle el `toLowerCase` no rompía nada, porque ningún test comprobaba el caso con mayúsculas. Lo mismo con el snapshot de P2: ejecuta todo `CoffeeCard`, pero no detecta que `onAdd` recibe otro café. Un test sin `expect` (como el `try/catch` de O3 con un 200) también suma cobertura. La cobertura sirve para encontrar código **no** probado; para saber si los tests prueban algo, hay que romper el código (los 💥).

### P2 · Snapshots

Añadimos `debería coincidir con el snapshot de la tarjeta de Etiopía` (`src/catalog/__snapshots__/coffee-card.spec.tsx.snap`).

- **💥 de O4** (`onAdd({ ...coffee, price: 0 })`): el snapshot **no** lo detecta. El HTML es idéntico: el fallo está en lo que se *hace* al pulsar, no en lo que se *pinta*. Sólo lo detecta el test de `onAdd` con `toHaveBeenCalledWith`.
- **Cambiar el texto del botón**: el snapshot falla y muestra el diff (`- Añadir Etiopía Yirgacheffe al carrito` / `+ Añadir al carrito`). Si el cambio era intencionado, se acepta con `u` en modo vigilancia (o `-u`).

**Cuándo nos parece útil**: para componentes pequeños y estables, donde el diff se lee de un vistazo y un cambio en el HTML casi siempre es un error (una tarjeta, un icono, el HTML de un correo). También como red rápida antes de un refactor que no debería cambiar nada visible.
**Cuándo es peligroso**: con componentes grandes el diff es tan largo que nadie lo revisa y se acaba pulsando `u` a ciegas, con lo que el test "aprueba" cualquier cosa, incluido un bug. Además no prueba comportamiento (el 💥 de O4 pasa) y falla con cambios irrelevantes (una clase CSS), así que provoca ruido. No sustituye a comprobaciones concretas como `getByRole` + `toHaveBeenCalledWith`.

### P3 · Temporizadores falsos

`src/catalog/use-offer-countdown.ts` + `.spec.ts`. `vi.useFakeTimers()` en `beforeEach` y `vi.useRealTimers()` en `afterEach`, y `vi.advanceTimersByTime()` dentro de `act`. Casos: empieza en el valor indicado, baja uno por segundo (1 s → 4 y 2 s más → 2), no cambia a los 999 ms, se queda en `{ left: 0, finished: true }` tras 10 s y llama a `clearInterval` al desmontar (`vi.spyOn(globalThis, 'clearInterval')` y `vi.getTimerCount()` a 0). El fichero entero tarda unos 25 ms: ningún test espera de verdad.

### P4 · Context

`src/catalog/cart-context.tsx`: `CartProvider` usa `useCart` por dentro y lo expone con Context. `useCartContext()` lo lee. El provider recibe `coffees` opcional (por defecto `[]`), así que `renderHook(() => useCartContext(), { wrapper: CartProvider })` funciona tal cual, y para el total usamos un wrapper con `coffees={coffees}`. Probamos también que dos consumidores dentro del mismo provider ven el mismo carrito.

**Sin el provider**: `useContext` devuelve el valor por defecto (`null`). En lugar de dejar que falle más tarde con un `Cannot read properties of null`, `useCartContext` lanza `useCartContext debe usarse dentro de un CartProvider`, y el test lo comprueba con `expect(() => renderHook(…)).toThrow(…)`.

### P5 · El formulario del laboratorio 4

`tueste/` es una copia del proyecto del laboratorio 4 (primer commit sin cambios), con su propio Vitest (`tueste/config/test`). Tests en `tueste/src/pods/edicion/edicion.component.spec.tsx`:

- Con un nombre de un carácter: aparece "El nombre necesita al menos dos caracteres.", el input queda `aria-invalid="true"` y `onSave` no se llama.
- Con datos válidos: `onSave` se llama una vez con `{ name: 'Kenia AA', origin: 'Kenia', roast: 'light', price: 12.5, notes: 'Grosella' }`.
- Con el precio vacío: "Introduce un precio." y `onSave` no se llama.

**El precio**: es un `<input type="number">` y el componente lee `event.target.valueAsNumber`, así que `onSave` tiene que recibir el **número** `12.5`, no el string `"12.5"`. `toHaveBeenCalledWith` compara con igualdad estricta de tipos, así que el test lo detecta. Lo comprobamos con el 💥 de la tabla (leer el valor mal da 125 y el test se pone rojo). El input vacío es `NaN`, y por eso el esquema responde "Introduce un precio.".

### P6 · Depurar un test

**Captura pendiente.** Pasos para hacerla:

1. Poner un breakpoint en `src/catalog/cart.ts`, dentro de `addToCart`.
2. En VS Code: *Terminal → Create JavaScript Debug Terminal* (o el desplegable `+` → *JavaScript Debug Terminal*).
3. Ejecutar `npm run test:run -- src/catalog/cart.spec.ts`. VS Code se engancha al proceso de Node y para en el breakpoint, con las variables (`cart`, `coffeeId`) en el panel de la izquierda.

Ejecutar sólo una parte de los tests:

- **Un fichero**: `npx vitest run src/catalog/cart.spec.ts` (el argumento filtra por ruta; vale un trozo, como `npx vitest run cart`).
- **Un test**: `npx vitest run -t "debería devolver 0 cuando el carrito está vacío"` (filtra por nombre), o cambiar ese `it` por `it.only` (o `describe.only` para un bloque). Ojo: no hay que subir un `.only`, porque deja sin ejecutar el resto.
- **En modo vigilancia** (`npm test`): `p` para filtrar por nombre de fichero, `t` para filtrar por nombre de test, `a` para volver a ejecutar todo y `h` para ver la ayuda.

## 🔥 Desafíos

### D1 · TDD

Orden de los commits (`git log --oneline -- src/catalog/coupon*`):

1. `D1 (red): applyCoupon tests first, against a stub that throws`: los 13 tests en rojo. El stub (`throw new Error('Sin implementar')`) existe sólo para que `npm run type-check` siga limpio. Hasta los tests de "Cupón no válido" están en rojo, porque el mensaje no coincide.
2. `D1 (green): applyCoupon with CAFE10 and ENVIO, case and whitespace insensitive`: implementación con un mapa `código → función`, `code.trim().toUpperCase()` y `Math.max(total - 3.9, 0)`. 13/13 en verde.
3. `D1 (refactor): …`: un caso con `\t…\n` imprimía un nombre de test partido en dos líneas. Lo cambiamos por `'  CaFe10  '`.

### D2 · MSW

`src/mocks/handlers.ts` + `server.ts` (`setupServer` de `msw/node`), y dos specs nuevos que no sustituyen a los de O3 y O5: `coffee.api.msw.spec.ts` y `coffee-catalog.msw.spec.tsx`. Los errores se simulan con `server.use(http.get('/api/coffees', () => new HttpResponse(null, { status: 503 })))`, y el fallo de red con `HttpResponse.error()`. Se usa `onUnhandledFrame: 'error'` (en MSW 3 sustituye a `onUnhandledRequest`) para que una petición sin handler haga fallar el test.

**¿Qué probamos en cada caso?**
- **Con el spy de `fetch`**: probamos que `getCoffees` *llama a `fetch`* con ciertos argumentos y sabe interpretar un `Response`. El test conoce *cómo* hacemos la petición.
- **Con MSW**: probamos que *se hace una petición HTTP* `GET /api/coffees` con `Accept: application/json`, y qué hace el código con la respuesta del "servidor". La petición sale de verdad del cliente y MSW la intercepta a nivel de red. En el catálogo, además, no mockeamos `getCoffees`: se prueba toda la cadena componente → API → red.

**¿Qué pasa si mañana usamos axios?** Lo probamos: reescribimos temporalmente `getCoffees` con `axios.get` (misma URL, misma cabecera, mismos errores) y ejecutamos los dos specs:

| Spec | Resultado con axios |
|---|---|
| `coffee.api.spec.ts` (spy de `fetch`) | **6 de 6 en rojo**: axios no usa `fetch`, el spy no se entera y la petición sale "de verdad" (y falla) |
| `coffee.api.msw.spec.ts` (MSW) | **5 de 6 en verde**: MSW intercepta también `XMLHttpRequest`, que es lo que usa axios |

El único test de MSW que falla es el de la red, porque comprueba `rejects.toThrow(TypeError)`, y axios envuelve el fallo en un `AxiosError` ("Network Error"). Es razonable: ese test fija un detalle de `fetch`. Conclusión: los tests con spy están acoplados a la implementación y hay que reescribirlos si cambia la librería, mientras que los de MSW prueban el contrato HTTP y sobreviven al cambio. El precio es algo más de montaje (servidor, `listen`/`resetHandlers`/`close`) y una dependencia más.

### D3 · CI

`.github/workflows/ci.yml`, en cada `push` y cada `pull_request`, con dos jobs en Node 22: el catálogo (`npm ci`, `npm run type-check`, `npm run test:run`) y `tueste/` (lo mismo con `npm run typecheck`). La insignia está arriba.

Demostración: la PR [#1](https://github.com/gabrielo100472219/frontend_lab6/pull/1) cambia `formatPrice` para que use coma decimal. El job del catálogo se puso en rojo (7 tests fallidos) y el de `tueste/` siguió en verde. La PR se cerró sin fusionar.

## ✅ Checklist

**Obligatorios**
- [x] O1 · Vitest configurado (jsdom, globals, restoreMocks, jest-dom, scripts `test` / `test:run`)
- [x] O2 · `cart.spec.ts`
- [x] O3 · `coffee.api.spec.ts` (con `it.each` y el experimento del `try/catch`)
- [x] O4 · `coffee-card.spec.tsx`
- [x] O5 · `coffee-catalog.spec.tsx` (+ test de mayúsculas para el 💥 de `filter`)
- [x] O6 · `use-cart.spec.ts`
- [x] O7 · Este README

**Opcionales**
- [x] P1 · Cobertura (100 %, test de `remove`)
- [x] P2 · Snapshot
- [x] P3 · Temporizadores falsos
- [x] P4 · Context
- [x] P5 · Formulario del laboratorio 4 (`tueste/`)
- [ ] P6 · Depurar un test: explicación hecha, **falta la captura** parados en el breakpoint

**Desafíos**
- [x] D1 · TDD (commits red → green → refactor)
- [x] D2 · MSW
- [x] D3 · GitHub Actions + insignia + PR que rompe un test

## 🤖 Bitácora de IA

Herramienta: **Claude Code** (Claude Opus 5.5) en la terminal, con acceso al repositorio. Escribió los tests, ejecutó cada 💥 y comprobó qué test se ponía rojo antes de dar nada por bueno.

### Prompt

"Implementa el laboratorio 6 del curso. El remoto es https://github.com/gabrielo100472219/frontend_lab6. Este es el enunciado: [enunciado completo del laboratorio]"

### Qué me dio

El proyecto completo, un commit por apartado: la configuración de Vitest, los tests de O2 a O6, los opcionales P1 a P5, los desafíos y este README. Los tests de O2, O3, O4 y O6 detectaron sus 💥 a la primera.

### Qué corregí y por qué

Lo que hubo que arreglar sobre la marcha, siempre al ejecutar algo y ver que no hacía lo esperado:

- **El 💥 de `filter` no lo detectaba nadie.** Los tests del buscador sólo escribían en minúsculas, así que quitar `filter.toLowerCase()` dejaba todo en verde, aunque la cobertura de esa línea fuera del 100 %. Añadimos el test con "BRA".
- **`npx vitest run` (sin `-c`) fallaba en los 8 ficheros.** Sin `-c`, Vitest usaba `vite.config.ts`, sin globals ni jsdom. Además, después de P5, el config del catálogo también recogía el spec de `tueste/`. Arreglo: `include: ['src/**/*.spec.{ts,tsx}']` y un `vitest.config.ts` que reexporta `config/test/config.ts`.
- **MSW 3 cambió la API.** La IA escribió `server.listen({ onUnhandledRequest: 'error' })`, que es la opción de MSW 2. Los tests pasaban, pero `npm run type-check` falló: en MSW 3 se llama `onUnhandledFrame`. Después comprobamos que la opción funciona: con el handler en otra URL, el test se pone en rojo.
- **Un `vi.spyOn(console, 'error')` que no hacía falta.** En el test de "usar el hook sin el provider", la IA silenció `console.error` dando por hecho que React imprimiría el error lanzado. Al quitarlo, la salida seguía limpia con React 19, así que lo borramos: código que no sirve para nada confunde a quien lo lee.
- **El aviso `outdated JSX transform`.** Aparecía en todos los tests de componentes porque el `tsconfig.json` de partida usa `"jsx": "react"` (el transform clásico). Cambiar el tsconfig no lo quitaba, porque la config de los tests no lo usa para eso. Lo arreglamos añadiendo `@vitejs/plugin-react` a `config/test/config.ts`, igual que en `vite.config.ts`.
- **Parecía que el modo vigilancia no funcionaba.** Desde el agente, `npm test` se ejecutaba una vez y terminaba. No era la config: Vitest desactiva la vigilancia cuando detecta que lo ejecuta un agente de IA (`AI_AGENT`) o cuando no hay TTY. Al ejecutarlo en una pseudo-terminal sin esa variable, se volvió a ejecutar solo al guardar.

¿Fallaban los tests de la IA al romper el código? Casi siempre sí, a la primera. Las excepciones fueron justo las que el enunciado plantea como trampa: el `filter` sin `toLowerCase`, el `try/catch` sin `expect.assertions` y el snapshot con el 💥 de O4.
