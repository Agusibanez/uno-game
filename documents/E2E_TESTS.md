# Pruebas End-to-End (E2E) - Capstone UNO

## Objetivo
Validar flujos principales del servidor UNO desde la perspectiva de cliente real, usando `fetch` en Jest contra la API REST en ejecución.

Archivo de pruebas:
- `test/e2e.fetch.test.js`

## Configuracion
- Framework: Jest
- Cliente HTTP: `fetch` (nativo de Node)
- Servidor E2E: se levanta con `app.listen(0)` en puerto aleatorio dentro del test.
- Base URL: `http://127.0.0.1:<puerto>/api`

## Flujos principales cubiertos

### 1. Autenticacion de usuario
Endpoints:
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

Validaciones:
- Registro exitoso (`201`).
- Login exitoso y token valido (`200`).
- `me` responde datos del usuario autenticado.
- Logout invalida token (`me` devuelve `401` despues).

### 2. Gestion de sesion de juego (crear -> unir -> ready -> iniciar -> repartir)
Endpoints:
- `POST /games`
- `POST /games/:id/join`
- `POST /games/:id/ready`
- `POST /games/:id/start`
- `POST /games/:id/deal`
- `GET /games/:id/my-hand`

Validaciones:
- Flujo completo sin errores.
- Cada jugador recibe 7 cartas tras `deal`.

### 3. Flujo de robo y avance de turno
Endpoints:
- `GET /games/:id/status`
- `POST /games/:id/draw`

Validaciones:
- El jugador de turno puede robar.
- Se roba al menos una carta.
- El turno cambia al siguiente jugador.

### 4. Regla UNO y desafio UNO
Endpoints:
- `GET /games/:id/status`
- `POST /games/:id/challenge-uno`
- `PATCH /games/:id/uno`

Validaciones:
- Desafio exitoso cuando el retado tiene 1 carta y no dijo UNO.
- Desafio fallido cuando el jugador ya dijo UNO a tiempo.

### 5. Jugar de nuevo (rematch) manteniendo puntajes
Endpoints:
- `GET /games/:id/scores`
- `POST /games/:id/end`
- `POST /games/:id/rematch`
- `GET /games/:id/my-hand`

Validaciones:
- El rematch inicia nueva ronda.
- Cada jugador vuelve a tener 7 cartas.
- La estructura de puntajes permanece disponible (no se reinicia la tabla).

## Resultados esperados
- Todas las pruebas del archivo E2E pasan.
- Los endpoints principales del flujo UNO quedan cubiertos en secuencia real.

## Problemas encontrados y resolucion
- **Bug de score persistente en 0**: `calculateScores` llamaba `scoreRepo.updateById` pero el repositorio no implementaba esa funcion.
- **Solucion**: se agrego `updateById(gameId, playerId, score)` en `src/repositories/score.repository.js`.

## Ejecucion

```bash
npm test -- --runInBand test/e2e.fetch.test.js
```

Para correr todo:

```bash
npm test
```
