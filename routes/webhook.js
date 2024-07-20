const express = require("express");
const { webook } = require("../controllers/subscription");

const router = express.Router();

router.post("/webhook", express.raw({ type: "application/json" }), webook);

module.exports = router;
