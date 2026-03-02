# Frontend UNO (MVP)

## Levantar proyecto

```bash
cd frontend
npm install
npm run dev
```

## Variables opcionales

Crear `.env` en `frontend/`:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

## Rutas

- `/login`
- `/lobby`
- `/game/:id`

## Estado actual

- Login/Register funcionando.
- Crear/unirse a partida por ID.
- Vista base de partida con polling + socket room.
- Acciones: jugar por `cardId`, robar, decir UNO.

## Siguiente iteracion recomendada

- UI de cartas con IDs reales para evitar input manual de `cardId`.
- Pantalla de historial (`/games/:id/history`) y scores en vivo.
- Manejo de toasts, loaders y errores por endpoint.
