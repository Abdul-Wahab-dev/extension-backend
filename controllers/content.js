const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { Content } = require("../models/Content");

// @route                   POST /api/v1/content
// @desc                    create content
// @access                  Private
exports.createContent = catchAsync(async (req, res, next) => {
  const { content, hash, url, domain } = req.body;
  const newContent = await Content.create({
    content,
    hash,
    url,
    domain,
    user: req.user._id,
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
  const { domain, page, limit } = req.query;
  let contents = null;

  const l_page = page * 1 || 1;
  const l_limit = limit * 1 || 5;
  const skip = (l_page - 1) * l_limit;

  if (domain)
    contents = await Content.find({ domain, user: req.user._id })
      .skip(skip)
      .limit(l_limit)
      .sort("-created_at");
  else
    contents = await Content.find({ user: req.user._id })
      .skip(skip)
      .limit(l_limit)
      .sort("-created_at");

  let total = 0;

  if (domain)
    total = await Content.countDocuments({ domain, user: req.user._id });
  else total = await Content.countDocuments({ user: req.user._id });

  if (!contents) {
    return res.status(200).json({
      contents: [],
      total,
    });
  }
  return res.status(200).json({
    contents,
    total,
  });
});

// @route                   PUT /api/v1/content/:id
// @desc                    update content
// @access                  Private
exports.updateContent = catchAsync(async (req, res, next) => {
  const { content, collections, hash } = req.body;
  const { id } = req.params;

  const updatedContent = await Content.findOneAndUpdate(
    {
      _id: id,
      user: req.user.id,
    },
    {
      content,
      collections,
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
  if (!id) {
    return next(
      new AppError("Unique is required to delete the content", 400, null)
    );
  }
  const updatedContent = await Content.findByIdAndUpdate(id, {
    disabled: true,
  });
  if (!updatedContent) {
    return next(new AppError("Failed to update the content", 400, null));
  }

  res.status(200).json({
    content: updatedContent,
  });
});

// @route                   GET /api/v1/content/domain
// @desc                    get all content domains
// @access                  Private
exports.getAllContentDomains = catchAsync(async (req, res, next) => {
  let domains = await Content.aggregate([
    {
      $match: {
        user: req.user._id,
      },
    },
    {
      $group: {
        _id: "$domain",
      },
    },
    {
      $project: {
        _id: 0,
        domain: "$_id",
      },
    },
  ]);
  if (!domains) {
    return res.status(200).json({
      domains: [],
    });
  }

  res.status(200).json({
    domains,
  });
});
