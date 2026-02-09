const router = require("express").Router();
const c = require("../controllers/card.controllers");
const {
  validateCreateCard,
} = require("../middlewares/card.validate.middleware");

router.post("/cards", validateCreateCard, c.create);
router.get("/cards/:id", c.read);
router.put("/cards/:id", c.update);
router.delete("/cards/:id", c.remove);

module.exports = router;
