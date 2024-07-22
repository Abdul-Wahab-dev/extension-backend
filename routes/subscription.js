const express = require("express");

const { create, update } = require("../controllers/subscription");
const { protect } = require("../controllers/authController");
const router = express.Router();

router.route("/").post(protect, create);
router.route("/update").post(protect, update);

module.exports = router;
