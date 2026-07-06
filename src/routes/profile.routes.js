const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const { requireProfileOwner } = require("../middleware/profile.middleware");

router.get("/", profileController.getProfile);
router.get("/search", profileController.searchProfiles);
router.get("/:id", requireProfileOwner, profileController.getProfileById);
router.post("/", profileController.createProfile);
router.delete("/:id", requireProfileOwner, profileController.deleteProfile);
router.put("/:id", requireProfileOwner, profileController.updateProfile);
module.exports = router;
