# Capstone – UNO API

## Descripción

Este proyecto implementa el backend del juego de cartas UNO mediante una API REST desarrollada en Node.js y Express.
La API permite gestionar usuarios, juegos, jugadores, cartas y puntuaciones, además de manejar el flujo completo de una partida.

El sistema incluye autenticación basada en JWT y una colección de Postman para la prueba de todos los endpoints.

---

## Arquitectura

La solución está construida como una **API REST monolítica en capas**, donde cada capa tiene responsabilidades bien definidas:

- **Capa de Presentación (API REST):** expone los endpoints HTTP y gestiona las solicitudes y respuestas.
- **Capa de Lógica de Negocio:** contiene las reglas del juego UNO, validaciones y flujo de la partida.
- **Capa de Persistencia:** gestiona el acceso a datos mediante un ORM y una base de datos relacional.

La comunicación entre capas es unidireccional y desacoplada, lo que facilita el mantenimiento y la escalabilidad del proyecto.

---

## Implementación

A nivel de implementación, el proyecto organiza el código siguiendo un patrón de capas:

- **Controllers:** reciben las solicitudes HTTP y delegan la lógica al servicio correspondiente.
- **Services:** implementan la lógica de negocio del juego.
- **Models:** definen las entidades y relaciones de la base de datos utilizando Sequelize ORM.
- **Routes:** definen las rutas de la API.
- **Middlewares:** manejan autenticación, autorización y validaciones.
- **Utils:** manejo centralizado de errores y utilidades comunes.

---

## Tecnologías utilizadas

- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- JWT (JSON Web Tokens)
- Postman (para pruebas de la API)

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
Instalar dependencias:

npm install

Crear un archivo .env con las siguientes variables:

DB_HOST=localhost
DB_PORT=5432
DB_NAME=uno_db
DB_USER=uno_user
DB_PASSWORD=uno12345
JWT_SECRET=Juguemosaluno
JWT_EXPIRES_IN=1d
Iniciar la aplicación:

npm start

La API estará disponible en:

http://localhost:3000