const router = require("express").Router();
const c = require("../controllers/game.controllers");
const auth = require("../middlewares/auth.middleware");

router.post("/games", auth, c.create);
router.get("/games/:id", c.read);
router.put("/games/:id", c.update);
router.delete("/games/:id", c.remove);
router.post("/games/:id/join", auth, c.join);
router.post("/games/:id/ready", auth, c.ready);
router.post("/games/:id/start", auth, c.start);
router.post("/games/:id/leave", auth, c.leave);
router.post("/games/:id/end", auth, c.end);
router.get("/games/:id/state", c.state);
router.get("/games/:id/players", c.players);
router.get("/games/:id/current-player", c.currentPlayer);
router.get("/games/:id/top-card", c.topCard);
router.get("/games/:id/scores", c.scores);

module.exports = router;
