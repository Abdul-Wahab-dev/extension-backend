const express = require("express");
const router = express.Router();
const { customerBillingPortal } = require("../controllers/billingPortal");
const { protect } = require("../controllers/authController");

router.route("/").get(protect, customerBillingPortal);

module.exports = router;
