# Aplicación de Principios SOLID – Capstone UNO API

Este documento describe brevemente cómo se aplicaron los principios SOLID en el backend del proyecto UNO API.

---

## 1) SRP – Single Responsibility Principle (Responsabilidad Única)

**Qué se aplicó:** Se separaron responsabilidades por capas y módulos.

- **Controllers**: solo gestionan HTTP (request/response).
- **Services**: contienen reglas de negocio (flujo del juego).
- **Repositories**: encapsulan acceso a datos (Sequelize).
- **Middlewares**: validación de entrada y autenticación.

**Ejemplo:** `game.service.js` orquesta lógica del juego y repositorios, mientras que la validación de inputs está en `game-validate.middleware.js`.

---

## 2) OCP – Open/Closed Principle (Abierto/Cerrado)

**Qué se aplicó:** Se extrajo la construcción del mazo para poder extender sin modificar el service.

- Antes: `buildBasicDeck()` estaba dentro de `game.service.js`
- Ahora: se movió a un módulo independiente:
  - `src/domain/deck/basic-deck.builder.js`

**Ejemplo en código:**  
`game.service.js` solo consume el builder:

- `await cardRepo.bulkCreate(buildBasicDeck(created.id));`

**Beneficio:** Se puede crear otro builder (por ejemplo para un mazo alternativo) sin modificar la lógica principal del service.

---

## 3) LSP – Liskov Substitution Principle (Sustitución de Liskov)

**Qué se aplicó:** Aunque en el proyecto no se usa herencia, se respeta LSP mediante contratos consistentes entre módulos equivalentes.

- Los módulos CRUD mantienen firmas y comportamientos coherentes.
- Los repositorios exponen operaciones comunes como `create`, `findByPk`, `findOne`, `destroy`, etc.

**Ejemplo:** `playerRepo`, `scoreRepo`, `cardRepo` siguen el mismo estilo de contrato, permitiendo reemplazar una implementación interna sin cambiar el consumo desde services.

---

## 4) ISP – Interface Segregation Principle (Segregación de Interfaces)

**Qué se aplicó:** En lugar de usar un repositorio o middleware “gigante”, se separaron en unidades pequeñas y específicas.

- Middlewares por recurso: `player-validate.middleware.js`, `game-validate.middleware.js`, etc.
- Repos por entidad: `gameRepo`, `playerRepo`, `scoreRepo`, etc.

**Beneficio:** Cada módulo expone solo lo necesario y evita dependencias innecesarias.

---

## 5) DIP – Dependency Inversion Principle (Inversión de Dependencias)

**Qué se aplicó:** La capa de negocio ya no depende directamente del ORM (Sequelize) ni de modelos, sino de repositorios.

- Antes: services llamaban directamente a modelos Sequelize.
- Ahora: services consumen `gameRepo`, `playerRepo`, `scoreRepo`, etc.

**Ejemplo:** En `game.service.js` se usa:

- `gameRepo.findById(...)`
- `gameRepo.updateById(...)`

**Beneficio:** Si se cambia ORM o fuente de datos, el impacto se concentra en repositories, no en la lógica de negocio.

---

## Manejo de errores desacoplado de HTTP

- Services lanzan **DomainErrors** (`NotFoundError`, `ConflictError`, etc.)
- `error.middleware.js` traduce los DomainErrors a HTTP status codes (400/401/403/404/409)

Esto evita que la lógica de negocio “conozca” el protocolo HTTP.
