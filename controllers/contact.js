const { Contact } = require("../models/Contact");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// @route                       POST /api/v1/contact
// @desc                        contact form info
// @access                      Public
exports.create = catchAsync(async (req, res, next) => {
  const { subject, detail, email } = req.body;

  if (!email || !subject) {
    return next(new AppError("Email and Subject are required", 400, null));
  }

  const newContact = await Contact.create({
    email,
    subject,
    detail,
  });

  res.status(200).json({ message: "Your query is successfully submitted" });
});
