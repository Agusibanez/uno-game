const router = require("express").Router();
const c = require("../controllers/score.controllers");

router.post("/scores", c.create);
router.get("/scores/:id", c.read);
router.put("/scores/:id", c.update);
router.delete("/scores/:id", c.remove);

module.exports = router;
