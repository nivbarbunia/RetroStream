const express = require("express");
const router = express.Router();
const configController = require("../controllers/config.controller");

router.get("/maps-key", configController.getMapsKey);

module.exports = router;
