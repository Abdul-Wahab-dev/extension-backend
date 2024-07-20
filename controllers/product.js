const Stripe = require("stripe");
const catchAsync = require("../utils/catchAsync");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.getProductList = catchAsync(async (req, res) => {
  // prod
  // [
  //   "prod_P0Oe9DF3JxUTOu",
  //   "prod_P0Og62gl5xh0pX",
  //   "prod_P0Ohz7FB1vsPJK",
  //   "prod_P0Oh6Gy96DjFE5",
  // ]
  //  local
  // [
  //   "prod_OxdiqnK6N9bRdw",
  //   "prod_OxdpOrQHJKOYJC",
  //   "prod_OxdtKi1rui9Fft",
  //   "prod_OxdzjNsZB6HwpG",
  // ]
  const products = await stripe.products.list({
    ids: [
      "prod_OxdiqnK6N9bRdw",
      "prod_OxdpOrQHJKOYJC",
      "prod_OxdtKi1rui9Fft",
      "prod_OxdzjNsZB6HwpG",
    ],
    expand: ["data.default_price"],
  });
  if (!products) {
    throw new AppError("Failed to fetch products", 400, null);
  }
  const formattedProduct = products.data.map((product) => {
    const priceObj = { ...product.default_price.metadata };
    return {
      id: product.id,
      name: product.name,
      metadata: product.metadata,
      price: {
        id: product.default_price.id,
        currency: product.default_price.currency,
        actualPrice: priceObj.actualPriceInDollars * 1,
      },
    };
  });
  return res.status(200).json({
    products: formattedProduct,
  });
});
