const router = require("express").Router();
const c = require("../controllers/card.controllers");

router.post("/cards", c.create);
router.get("/cards/:id", c.read);
router.put("/cards/:id", c.update);
router.delete("/cards/:id", c.remove);

module.exports = router;
