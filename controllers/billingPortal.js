const { Stripe } = require("stripe");
const catchAsync = require("../utils/catchAsync");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { Payment } = require("../models/Payment");
const AppError = require("../utils/appError");
const User = require("../models/User");
const { Package } = require("../models/Package");

// @route                       GET /api/v1/billing-portal
// @desc                        get the current user login portal
// @access                      Private
exports.customerBillingPortal = catchAsync(async (req, res) => {
  const { customerId } = req.user;
  if (customerId) {
    const billingPortal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `http://localhost:8000/api/v1/test`,
    });

    res.status(200).json({
      billingPortal,
    });
  }
});
