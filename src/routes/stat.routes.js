const router = require("express").Router();
const c = require("../controllers/stat.controllers");

router.get("/stats/requests", c.requests);
router.get("/stats/response-times", c.responseTimes);
router.get("/stats/status-codes", c.statusCodes);
router.get("/stats/popular-endpoints", c.popularEndpoints);

module.exports = router;
