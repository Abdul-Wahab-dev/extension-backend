const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { Content } = require("../models/Content");

// @route                   POST /api/v1/content
// @desc                    create content
// @access                  Private
exports.createContent = catchAsync(async (req, res, next) => {
  const { content, hash, url } = req.body;

  const newContent = await Content.create({
    content,
    hash,
    url,
  });

  if (!newContent) {
    return next(new AppError("Failed to create the new content", 400, null));
  }

  res.status(201).json({
    content: newContent,
  });
});

// @route                   GET /api/v1/content
// @desc                    get all content
// @access                  Private
exports.getAllContent = catchAsync(async (req, res, next) => {
  let contents = await Content.find({});
  if (!contents) {
    return next(new AppError("Cannot find any record"), 400, null);
  }
  res.status(200).json({
    contents,
  });
});

// @route                   PUT /api/v1/content/:id
// @desc                    update content
// @access                  Private
exports.updateContent = catchAsync(async (req, res, next) => {
  const { content, hash } = req.body;
  const { id } = req.params;

  const updatedContent = await Content.findByIdAndUpdate(
    id,
    {
      content,
      hash,
    },
    {
      upsert: true,
      new: true,
    }
  );
  if (!updatedContent) {
    return next(new AppError("Failed to update the content", 400, null));
  }

  res.status(200).json({
    content: updatedContent,
  });
});

// @route                   DELETE /api/v1/content/:id
// @desc                    delete content
// @access                  Private
exports.deleteContent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedContent = await Content.findByIdAndDelete(id);
  if (!updatedContent) {
    return next(new AppError("Failed to update the content", 400, null));
  }

  res.status(200).json({
    content: updatedContent,
  });
});
