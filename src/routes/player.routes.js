const router = require("express").Router();
const c = require("../controllers/player.controllers");
const auth = require("../middlewares/auth.middleware");
const {
  validateCreatePlayer,
  validateUpdatePlayer,
  validateRegister,
  validateLogin,
} = require("../middlewares/player-validate.middleware");

router.post("/auth/register", validateRegister, c.register);
router.post("/auth/login", validateLogin, c.login);
router.post("/auth/logout", auth, c.logout);
router.get("/auth/me", auth, c.me);

router.post("/players", validateCreatePlayer, c.create);
router.get("/players/:id", c.read);
router.put("/players/:id", validateUpdatePlayer, c.update);
router.delete("/players/:id", c.remove);

module.exports = router;
