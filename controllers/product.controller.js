import { productModel } from "../model/product.model.js";
import { userModel } from "../model/user.model.js";

//add image
export async function addimage(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded or invalid file types.");
    }
    const baseUrl = `${req.protocol}://${req.get("host")}/image`;
    const fileUrls = req.files.map((file) => `${baseUrl}/${file.filename}`);
    res.status(200).json({ message: "success", fileUrls });
  } catch (error) {
    console.log(`Error while adding image: ${error.message}`);
    res.status(500).send(`Error while adding image: ${error.message}`);
  }
}

// add product

export async function addproduct(req, res) {
  const {
    itemName,
    itemDesc,
    itemPrice,
    anyDiscount,
    itemPriceAfterDiscount,
    itemCategory,
    itemImage,
  } = req.body;
  try {
    const newProduct = new productModel({
      emailAddress: req.rootUser.emailAddress,
      itemName,
      itemDesc,
      itemPrice,
      anyDiscount,
      itemPriceAfterDiscount,
      itemCategory,
      itemImage,
    });
    const savedProducts = await newProduct.save();
    await userModel.updateOne(
      { emailAddress: req.rootUser.emailAddress },
      { $push: { productDetails: savedProducts._id } }
    );
    const user = await userModel
      .findOne({
        emailAddress: req.rootUser.emailAddress,
      })
      .select("-password")
      .populate("productDetails");

    res.status(200).json({ message: "success", user });
  } catch (error) {
    console.log(`Error while adding product: ${error.message}`);
    res.status(500).send(`Error while adding product: ${error.message}`);
  }
}

//remove product

export async function removeproduct(req, res) {
  const { id } = req.body;
  try {
    const deletedProduct = await productModel.findOneAndDelete({
      $and: [{ emailAddress: req.rootUser.emailAddress }, { _id: id }],
    });
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    await userModel.updateOne(
      {
        emailAddress: req.rootUser.emailAddress,
      },
      {
        $pull: { productDetails: id },
      }
    );
    const user = await userModel
      .findOne({ emailAddress: req.rootUser.emailAddress })
      .populate("productDetails");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Product removed successfully", user });
  } catch (error) {
    console.log(`Error while removing product: ${error.message}`);
    res.status(500).send(`Error while removing product: ${error.message}`);
  }
}

//update product
export async function updateProduct(req, res) {
  const {
    itemName,
    itemDesc,
    itemPrice,
    anyDiscount,
    itemPriceAfterDiscount,
    itemCategory,
    itemImage,
    id,
  } = req.body;
  try {
    const updatedProduct = await productModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          itemName,
          itemDesc,
          itemPrice,
          anyDiscount,
          itemPriceAfterDiscount,
          itemCategory,
          itemImage,
        },
      }
    );
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    const user = await userModel
      .findOne({ emailAddress: req.rootUser.emailAddress })
      .populate("productDetails");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Product updated successfully", user });
  } catch (error) {
    console.log(`Error while updating product: ${error.message}`);
    res.status(500).send(`Error while updating product: ${error.message}`);
  }
}

//fetch product of one user for their dashboard
export async function fetchProduct(req, res) {
  try {
    const products = await userModel
      .findOne({
        emailAddress: req.rootUser.emailAddress,
      })
      .select("-password")
      .populate("productDetails");
    if (!products)
      return res.status(404).json({ message: "Product not found" });

    res.json({ products });
  } catch (error) {
    console.log(`Error while fetching product: ${error.message}`);
    res.status(500).send(`Error while fetching product: ${error.message}`);
  }
}

//fetch all users' product
export async function fetchAllProduct(req, res) {
  try {
    const productsFromAllUser = await userModel
      .find({})
      .select("-password")
      .populate("productDetails");
    if (!productsFromAllUser)
      return res.status(404).json({ message: "Product not found" });

    res.json({ productsFromAllUser });
  } catch (error) {
    console.log(`Error while fetching product: ${error.message}`);
    res.status(500).send(`Error while fetching product: ${error.message}`);
  }
}
