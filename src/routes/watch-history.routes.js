const express = require("express");
const router = express.Router();
const watchHistoryController = require("../controllers/watch-history.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

router.get("/continue", watchHistoryController.getContinueWatching);
router.get("/search", requireAdmin, watchHistoryController.searchWatchHistory);
router.get("/", requireAdmin, watchHistoryController.getWatchHistory);
router.get("/:id", requireAdmin, watchHistoryController.getWatchHistoryById);
router.post("/", requireAdmin, watchHistoryController.createWatchHistory);
router.put("/progress", watchHistoryController.upsertProgress);
router.put("/:id", requireAdmin, watchHistoryController.updateWatchHistory);
router.delete("/:id", watchHistoryController.deleteWatchHistory);

module.exports = router;