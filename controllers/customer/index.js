const { Stripe } = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
// @route                   POST /api/subscription/customer
// @desc                    create customer
// @access                  Private
exports.create = catchAsync(async (req, res) => {
  const { email } = req.body;
  let customer = await createCustomerHelper(email);

  if (!customer) {
    throw new AppError("Failed to get the customer", 400, null);
  }
  return res.status(201).json({
    customer,
  });
});
// @route                   GET /api/subscription/customer
// @desc                    get all customers
// @access                  Private
exports.customerList = catchAsync(async (req, res) => {
  const customers = await stripe.customers.list({});

  return res.status(200).json({
    customers,
  });
});
// @route                   DELETE /api/subscription/customer
// @desc                    delete customer
// @access                  Private
exports.deleteCustomer = catchAsync(async (req, res) => {
  const { customerId } = req.body;

  const customer = await stripe.customers.del(customerId);

  return res.status(200).json({
    customer,
  });
});

exports.createCustomerHelper = async (email) => {
  try {
    let customer;
    // check if customer exist then return that customer
    const customerQuery = await stripe.customers.search({
      query: `email:\'${email}\'`,
    });
    if (!customerQuery.data.length) {
      customer = await stripe.customers.create({
        email,
      });
    } else {
      customer = customerQuery.data[0];
    }

    return customer;
  } catch (error) {
    console.log({ error });
    return null;
  }
};
