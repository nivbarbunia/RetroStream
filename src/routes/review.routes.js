const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");

router.get("/content/:contentId", reviewController.getReviews);
router.post("/content/:contentId", reviewController.createReview);
router.put("/:id", reviewController.editReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
