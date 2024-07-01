const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { Setting } = require("../models/Setting");

// @route                   POST /api/v1/setting
// @desc                    create content
// @access                  Private
exports.createOrUpdate = catchAsync(async (req, res) => {
  const { component } = req.body;

  const setting = await Setting.findOneAndUpdate(
    { user: req.user.id },
    {
      defaultComponent: component,
      user: req.user._id,
    },
    {
      upsert: true,
      new: true,
    }
  );

  return res.status(200).json({
    setting,
  });
});

// @route                   get /api/v1/setting
// @desc                    get setting
// @access                  Private
exports.getSetting = catchAsync(async (req, res) => {
  const setting = await Setting.findOne({ user: req.user.id });

  return res.status(200).json({ setting });
});
