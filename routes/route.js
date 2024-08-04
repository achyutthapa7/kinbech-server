import express from "express";
import {
  registration,
  login,
  verification,
  dashboard,
  logout,
  updatepassword,
  updateusername,
  forgetpassword,
  isauthenticated,
  isverified,
} from "../controllers/user.controller.js";
import { authentication, verificationauth } from "../auth/auth.js";
const router = express.Router();
import multer from "multer";
import {
  addimage,
  addproduct,
  fetchAllProduct,
  fetchProduct,
  removeproduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { checkout } from "../controllers/checkout.controller.js";
router.post("/registration", registration);
router.post("/login", login);
router.post("/verification", verification);
router.get("/dashboard", authentication, dashboard);
router.get("/logout", authentication, logout);
router.post("/forgetpassword", authentication, forgetpassword);
router.put("/updatepassword", authentication, updatepassword);
router.put("/updateusername", authentication, updateusername);
router.get("/isauthenticated", authentication, isauthenticated);
router.get("/isverified", verificationauth, isverified);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/my-uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}_${file.originalname}`);
  },
});
const upload = multer({ storage: storage });
router.post("/addimage", upload.array("image", 5), addimage);
router.post("/addproduct", authentication, addproduct);
router.post("/removeproduct", authentication, removeproduct);
router.put(
  "/updateproduct",
  authentication,
  upload.array("image", 5),
  updateProduct
);
router.get("/fetchproduct", authentication, fetchProduct);
router.get("/fetchAllProduct", authentication, fetchAllProduct);

router.post("/checkout", authentication, checkout);

export { router };
