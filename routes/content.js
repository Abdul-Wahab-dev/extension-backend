const express = require("express");
const {
  createContent,
  getAllContent,
  updateContent,
  deleteContent,
  getAllContentDomains,
  getAllURLBaseContent,
  getAllUrls,
} = require("../controllers/content");
const { protect, checkLimit } = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .post(protect, checkLimit, createContent)
  .get(protect, getAllContent);

router
  .route("/:id")
  .put(protect, checkLimit, updateContent)
  .delete(protect, deleteContent);
router.route("/domain").get(protect, getAllContentDomains);
router.route("/test").get((req, res) => {
  res.send("Everything alright!");
});

router.route("/url").get(protect, getAllURLBaseContent);
router.route("/urls").get(protect, getAllUrls);

module.exports = router;
