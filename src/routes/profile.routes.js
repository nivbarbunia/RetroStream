const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");

router.get("/", profileController.getProfile);
router.get("/search", profileController.searchProfiles); 
router.get("/:id", profileController.getProfileById);
router.post("/", profileController.createProfile);
router.delete("/:id", profileController.deleteProfile);
router.put("/:id", profileController.updateProfile); 
module.exports = router;