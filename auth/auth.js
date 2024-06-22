import jwt from "jsonwebtoken";
import { userModel } from "../model/model.js";

//login auth
export async function authentication(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(404).json({ message: "Login First" });
    const isVerify = await jwt.verify(token, process.env.SECRET_KEY);
    if (!isVerify) return res.status(404).json({ message: "Login First" });
    const rootUser = await userModel.findOne({ _id: isVerify._id });
    req.rootUser = rootUser;
    next();
  } catch (err) {
    console.log(`Error while authentication: ${err.message}`);
  }
}

//registration verification

export async function verificationauth(req, res, next) {
  try {
    const emailAddress = req.cookies.emailAddress;
    if (!emailAddress)
      return res.status(404).json({ message: "Register First" });
    const user = await userModel.findOne({ emailAddress });
    req.rootUser = rootUser;
    next();
  } catch (err) {
    console.log(`Error while verificationauth: ${err.message}`);
  }
}
