import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
export const checkout = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { items } = req.body;

    const lineItems = items.flat().map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.itemName,
        },

        unit_amount: item.itemPriceAfterDiscount * 100,
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });
    res.status(200).json(session);
  } catch (error) {
    console.log("error is:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
