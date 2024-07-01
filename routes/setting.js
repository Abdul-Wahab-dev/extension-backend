const express = require("express");
const { getSetting, createOrUpdate } = require("../controllers/setting");
const { protect } = require("../controllers/authController");
const router = express.Router();

router.route("/").post(protect, createOrUpdate).get(protect, getSetting);

// router.route("/domain").get(protect, getAllContentDomains);
router.route("/test").get((req, res) => {
  res.send("Everything alright!");
});

module.exports = router;
