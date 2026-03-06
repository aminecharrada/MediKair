// COMMENTED OUT - Stripe Online Payment
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// const calculateOrderAmount = (shipping_fee, total_amount) => {
//   return shipping_fee + total_amount;
// };

// COMMENTED OUT - Original Stripe Payment Controller
/*
const paymentController = async (req, res) => {
  const { cart, shipping_fee, total_amount, shipping } = req.body;
  // console.log('cart : ', cart )
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(shipping_fee, total_amount),
      currency: "USD",
      description: "Paying for shopping",
      shipping,
    });
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
*/

// NEW: Cash on Delivery Payment Controller
// This endpoint is kept for backward compatibility but returns COD info instead
const paymentController = async (req, res) => {
  const { cart, shipping_fee, total_amount, shipping } = req.body;
  try {
    // For Cash on Delivery, we don't need Stripe payment intent
    // Just return a success response indicating COD payment method
    return res.status(200).json({
      success: true,
      message: "Cash on Delivery order - No online payment required",
      paymentMethod: "Cash on Delivery",
      totalAmount: shipping_fee + total_amount,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = paymentController;
