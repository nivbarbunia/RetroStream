const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

router.get("/by-origin", requireAdmin, statsController.getStatsByOrigin);
router.get("/by-genre", requireAdmin, statsController.getStatsByGenre);
router.get("/top-watched", requireAdmin, statsController.getTopWatched);
router.get("/top-liked", requireAdmin, statsController.getTopLiked);
router.get("/totals", requireAdmin, statsController.getTotals);

module.exports = router;
