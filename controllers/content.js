const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { Content } = require("../models/Content");

// @route                   POST /api/v1/content
// @desc                    create content
// @access                  Private
exports.createContent = catchAsync(async (req, res, next) => {
  const tempBody = JSON.stringify(req.body).replace(/{{}}/g, "<");
  req.body = JSON.parse(tempBody);
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

  const l_page = page * 1 || 1;
  const l_limit = limit * 1 || 5;
  const skip = (l_page - 1) * l_limit;
  const filters = {
    disabled: false,
    $or: [{ user: req.user._id }, { shareWith: req.user.email }],
  };
  if (domain) {
    filters.domain = domain;
  }
  const contents = await Content.find(filters)
    .populate({
      path: "sharedBy",
      select: "name email",
    })
    .skip(skip)
    .limit(l_limit)
    .sort("-created_at")
    .select("-updated_at -__v -created_at");

  const total = await Content.countDocuments(filters);

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
  const { content, collections, hash, shareWith } = req.body;
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
      shareWith: shareWith || [],
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
  const updatedContent = await Content.findOneAndUpdate(
    {
      _id: id,
      user: req.user.id,
    },
    {
      disabled: true,
    }
  );
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
        $or: [{ user: req.user._id }, { shareWith: req.user.email }],
        disabled: false,
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

// @route                   GET /api/v1/content/url/:url
// @desc                    get all content that has the url
// @access                  Private
exports.getAllURLBaseContent = catchAsync(async (req, res, next) => {
  const { url } = req.query;

  if (!url) {
    return res.status(200).json({
      contents: [],
    });
  }

  const contents = await Content.find({
    disabled: false,
    url: url,
    $or: [{ user: req.user._id }, { shareWith: req.user.email }],
  });

  if (!contents || !contents.length) {
    return res.status(200).json({
      contents: [],
    });
  }

  return res.status(200).json({
    contents,
  });
});

// @route                   GET /api/v1/content/urls
// @desc                    get all the urls from the content
// @access                  Private
exports.getAllUrls = catchAsync(async (req, res, next) => {
  const contents = await Content.find({
    "collections.shareWith": req.user.email,
  });

  return res.status(200).json({ contents });
});
