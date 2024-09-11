const { Stripe } = require("stripe");
const catchAsync = require("../utils/catchAsync");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { Payment } = require("../models/Payment");
const AppError = require("../utils/appError");
const User = require("../models/User");
const { Package } = require("../models/Package");
const { createCustomerHelper } = require("./customer/index");
// @route                   POST /api/subscription
// @desc                    create subscription
// @access                  Private
exports.create = catchAsync(async (req, res) => {
  const { email, _id } = req.user;
  let customer = await createCustomerHelper(email);
  const { priceId } = req.body;
  if (!priceId) {
    throw new AppError("Price not found", 400, null);
  }
  if (!customer) {
    throw new AppError("Customer not found", 400, null);
  }
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/failed",
    expand: ["subscription"],
    metadata: {
      email,
    },
  });

  if (!session) {
    return next(
      new AppError("Failed to create subscription session", 400, null)
    );
  }

  // const
  await Payment.create({
    amount: session.amount_total,
    checkoutSessionId: session.id,
    user: _id,
    plan: priceId,
    billingReason: "",
  });

  await User.findByIdAndUpdate(_id, { customerId: customer.id });
  return res.json({
    session,
  });
});

// @route                   POST /api/subscription/update
// @desc                    update subscription
// @access                  Private
exports.update = catchAsync(async (req, res) => {
  const { email, _id, customerId } = req.user;

  const { priceId } = req.body;

  // get the current user subscriptions
  const subscriptionList = await stripe.subscriptions.list({
    customer: customerId,
  });

  // if the subscripion is exist then update the subscription
  if (subscriptionList.data[0]) {
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionList.data[0].id,
      {
        items: [
          {
            id: subscriptionList.data[0].items.data[0].id,
            price: priceId,
          },
        ],
        payment_behavior: "pending_if_incomplete",
      }
    );
  }

  return res.status(200).json({ success: true });
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

exports.webook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log({ err });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    //Event when the subscription started
    case "checkout.session.completed":
      console.log("New Subscription started!");

      const invoice = event.data.object.invoice;
      const checkoutSessionId = event.data.object.id ?? "";
      if (checkoutSessionId) {
        await Payment.findOneAndUpdate(
          {
            checkoutSessionId,
          },
          {
            externalId: invoice ?? "",
          }
        );
      }
      break;

    // Event when the payment is successfull (every subscription interval)
    case "invoice.paid":
      // set the subscription status to active
      // get the product from subscription
      if (
        event &&
        event.data &&
        event.data.object &&
        event.data.object.subscription
      ) {
        const subscription = await stripe.subscriptions.retrieve(
          event.data.object.subscription,
          {
            expand: ["plan.product"],
          }
        );

        const plan = subscription.plan;
        const user = await User.findOne({ customerId: subscription.customer });
        if (user) {
          // payment status true and billing reason
          await Payment.findOneAndUpdate(
            {
              externalId: event.data.object.id,
            },
            {
              billingReason: event.data.object.billing_reason ?? "invoice paid",
              success: true,
              plan: plan.id,
              user: user._id,
            },
            {
              upsert: true,
              new: true,
            }
          );

          // update the user package
          const endDate = new Date(subscription.ended_at);

          if (plan && plan.product)
            await Package.findOneAndUpdate(
              {
                user: user._id,
              },
              {
                plan: plan.product.name ?? "ERROR",
                status: subscription.status,
                subEndDate: `${endDate}`,
                planId: plan.id ?? "",
                contentLimit: 20,
              }
            );
        }
      }
      break;

    // Event when the payment failed due to card problems or insufficient funds (every subscription interval)
    case "invoice.payment_failed":
      console.log("Invoice payment failed!");
      // set subscription status to incomplete
      // can notify the customer

      break;

    // Event when subscription is updated
    case "customer.subscription.updated":
      // can
      console.log("Subscription updated!");
      if (event && event.data && event.data.object && event.data.object.id) {
        const subscription = await stripe.subscriptions.retrieve(
          event.data.object.id,
          {
            expand: ["plan.product"],
          }
        );

        const plan = subscription.plan;
        const user = await User.findOne({ customerId: subscription.customer });
        if (user) {
          // update the user package
          const endDate = new Date(subscription.ended_at);

          if (plan && plan.product)
            await Package.findOneAndUpdate(
              {
                user: user._id,
              },
              {
                plan: plan.product.name ?? "ERROR",
                status: subscription.status,
                subEndDate: `${endDate}`,
                contentLimit: 40,
                planId: plan.id ?? "",
              }
            );
        }
      }
      break;

    case "customer.subscription.deleted":
      //
      console.log("Subscription cancelled!");

      const subscription = event.data.object;
      if (subscription) {
        const user = await User.findOne({ customerId: subscription.customer });
        if (user) {
          await Package.findOneAndUpdate(
            {
              user: user._id,
            },
            {
              contentLimit: 0,
              status: subscription.status,
            }
          );
        }
      }

      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send();
};
