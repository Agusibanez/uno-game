const router = require("express").Router();
const c = require("../controllers/game.controllers");

router.post("/games", c.create);
router.get("/games/:id", c.read);
router.put("/games/:id", c.update);
router.delete("/games/:id", c.remove);

module.exports = router;
