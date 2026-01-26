const router = require("express").Router();
const c = require("../controllers/player.controllers");

router.post("/players", c.create);
router.get("/players/:id", c.read);
router.put("/players/:id", c.update);
router.delete("/players/:id", c.remove);

module.exports = router;
