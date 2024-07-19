import mongoose from "mongoose";
const productSchema = mongoose.Schema(
  {
    emailAddress: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    itemDesc: {
      type: String,
      required: true,
    },
    itemPrice: {
      type: Number,
      required: true,
    },
    anyDiscount: {
      type: Number,
    },
    itemPriceAfterDiscount: {
      type: Number,
    },
    itemCategory: {
      type: String,
      required: true,
    },

    itemImage: {
      type: [String],
      required: true,
      default: "https://via.placeholder.com/200",
    },
  },
  { timeStamps: true }
);
export const productModel = mongoose.model("product_details", productSchema);
