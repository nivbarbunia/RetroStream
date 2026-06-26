// Routes for post operations — connects URLs to controller functions
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
 
router.get("/", postController.getPosts);
router.post("/", postController.createPost);
router.delete("/:id", postController.deletePost);

module.exports = router;
