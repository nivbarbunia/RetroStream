const express = require("express");
const router = express.Router();
const contentController = require("../controllers/content.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

router.get("/", contentController.getContent);
router.get("/search", contentController.searchContent);
router.get("/discover", contentController.discoverContent);
router.get("/liked", contentController.getLikedContent);
router.get("/:id/youtube", contentController.getYoutubeClip);
router.get("/:id", contentController.getContentById);
router.post("/", requireAdmin, contentController.createContent);
router.delete("/:id", requireAdmin, contentController.deleteContent);
router.put("/:id", requireAdmin, contentController.updateContent);
router.put("/:id/like", contentController.toggleLike);
module.exports = router;