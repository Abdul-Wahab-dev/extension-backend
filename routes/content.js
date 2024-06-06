const express = require("express");
const {
  createContent,
  getAllContent,
  updateContent,
  deleteContent,
  getAllContentDomains,
} = require("../controllers/content");
const { verifyToken } = require("../controllers/authController");
const router = express.Router();

router.route("/").post(createContent).get(verifyToken, getAllContent);

router.route("/:id").put(updateContent).delete(deleteContent);
router.route("/domain").get(getAllContentDomains);
router.route("/test").get((req, res) => {
  res.send("Everything alright!");
});

module.exports = router;
