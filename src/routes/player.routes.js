const router = require("express").Router();
const c = require("../controllers/player.controllers");
const auth = require("../middlewares/auth.middleware");

router.post("/auth/register", c.register);
router.post("/auth/login", c.login);
router.post("/auth/logout", auth, c.logout);
router.get("/auth/me", auth, c.me);

router.post("/players", c.create);
router.get("/players/:id", c.read);
router.put("/players/:id", c.update);
router.delete("/players/:id", c.remove);

module.exports = router;
