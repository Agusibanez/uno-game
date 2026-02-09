const router = require("express").Router();
const c = require("../controllers/score.controllers");
const {
  validateCreateScore,
  validateUpdateScore,
} = require("../middlewares/score-validate.middleware");

router.post("/scores", validateCreateScore, c.create);
router.get("/scores/:id", c.read);
router.put("/scores/:id", validateUpdateScore, c.update);
router.delete("/scores/:id", c.remove);

module.exports = router;
