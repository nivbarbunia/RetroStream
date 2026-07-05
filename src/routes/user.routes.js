const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { requireLogin, requireAdmin } = require("../middleware/auth.middleware");

// current user's own account (any logged-in user)
router.get("/me", requireLogin, userController.getMe);

// admin-only: list + search all users
router.get("/", requireLogin, requireAdmin, userController.getUsers);
router.get("/search", requireLogin, requireAdmin, userController.searchUsers);

// update / delete — permission checked inside the controller (self or admin)
router.put("/:id", requireLogin, userController.updateUser);
router.delete("/:id", requireLogin, userController.deleteUser);

module.exports = router;