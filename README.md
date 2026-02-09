# Capstone – UNO API

## Descripción

Este proyecto implementa el backend del juego de cartas UNO mediante una API REST desarrollada en Node.js y Express.
La API permite gestionar usuarios, juegos, jugadores, cartas y puntuaciones, además de manejar el flujo básico de una partida (join, ready, start, end, state, players, scores).

Incluye autenticación basada en JWT y una colección de Postman para probar todos los endpoints.

---

## Arquitectura

La solución está construida como una **API REST monolítica en capas** (Layered Architecture), con separación clara de responsabilidades:

- **Capa de Presentación (API REST):** expone endpoints HTTP (routes/controllers), aplica validaciones de entrada (middlewares) y transforma errores de dominio a respuestas HTTP.
- **Capa de Lógica de Negocio (Domain/Services):** contiene reglas y flujo del juego (por ejemplo: join/ready/start/end), sin depender de detalles HTTP.
- **Capa de Persistencia (Repositories + ORM):** encapsula el acceso a datos mediante repositorios; Sequelize y los modelos quedan aislados detrás de estos repositorios.

La dependencia entre capas es unidireccional: **Presentación → Negocio → Persistencia**, lo que permite mantener el código organizado y reducir el impacto de cambios (por ejemplo, cambiar el ORM afectaría principalmente a la capa de persistencia).

---

## Implementación (estructura del proyecto)

- **controllers/**: reciben requests y construyen responses (mensajes HTTP).
- **services/**: lógica del dominio (reglas del juego, decisiones del flujo).
- **repositories/**: operaciones de persistencia (abstraen Sequelize).
- **models/**: entidades y relaciones (Sequelize).
- **routes/**: definición de endpoints de la API.
- **middlewares/**: autenticación, validaciones y manejo de errores.
- **utils/**: utilidades comunes (async handler, errores de dominio, etc).

---

## Tecnologías utilizadas

- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- JWT (JSON Web Tokens)
- Postman

---

## Requisitos

- Node.js 18 o superior
- PostgreSQL 13 o superior
- npm

---

## Configuración

1. Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd capstone
```
