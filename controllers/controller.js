import authentication from "../auth/auth.js";
import sendOtp from "../helpers/sendOtp.js";
import { userModel } from "../model/model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//user registration
export async function registration(req, res) {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      emailAddress,
      userName,
      password,
      confirmPassword,
    } = req.body;
    const userExistByEmailAddress = await userModel.findOne({ emailAddress });
    const userExistByUserName = await userModel.findOne({ userName });
    if (userExistByEmailAddress)
      return res
        .status(401)
        .json({ message: "Email address already exist, try another" });
    if (userExistByUserName)
      return res.status(402).json({ message: "User name should be unique" });
    const verificationCode = Math.floor(
      Math.random() * 899999 + 100000
    ).toString();
    const verificationCodeExpiry = Date.now() + 1 * 1000 * 60;
    const title = "verify your email";
    const heading = "verify your email";
    const paragraph =
      "Thank you for registering with us. Please use the verification code below to complete your registration:";
    if (password != confirmPassword)
      return res
        .status(403)
        .json({ message: "Password don't match,please try again" });
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      emailAddress,
      userName,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpiry,
    });
    await newUser.save();
    res.cookie("emailAddress", emailAddress);
    sendOtp(verificationCode, emailAddress, title, heading, paragraph);
    res.status(200).json(newUser);
  } catch (error) {
    console.log(`Error while registration: ${error.message}`);
  }
}

//user verification
export async function verification(req, res) {
  try {
    const { verificationCode } = req.body;
    const emailAddress = req.cookies.emailAddress;
    const user = await userModel.findOne({ emailAddress });
    if (!verificationCode && (user || !user))
      return res
        .status(403)
        .json({ message: "Please provide verification code" });
    if (!user)
      return res.status(404).json({ message: "You have to register first" });
    if (user.isVerified == true)
      return res.status(201).json({ message: "You are verified" });
    else {
      if (
        Date.now() > user.verificationCodeExpiry &&
        user.isVerified == false
      ) {
        await userModel.deleteOne();
        res.cookie("emailAddress", "");
        return res
          .status(400)
          .json({ message: "Verification Code is Expired" });
      }
    }

    if (verificationCode === user.verificationCode) {
      await userModel.updateOne({
        $set: {
          isVerified: true,
        },
      });
      return res.status(200).json({ message: "Verification successful" });
    } else {
      return res.status(401).json({ message: "Verification code is wrong" });
    }
  } catch (error) {
    console.log(`Error while login: ${error.message}`);
  }
}

//user login
export async function login(req, res) {
  try {
    const { userName, password } = req.body;
    const userExistByUserName = await userModel.findOne({ userName });
    if (!userExistByUserName)
      return res.status(404).json({ message: "User Not Found" });
    if (userExistByUserName.isVerified == false)
      return res
        .status(402)
        .json({ message: "cannot login without verification" });

    const passwordIsCorrect = await bcrypt.compare(
      password,
      userExistByUserName.password
    );

    if (passwordIsCorrect) {
      const token = await jwt.sign(
        { _id: userExistByUserName._id },
        process.env.SECRET_KEY
      );
      res.cookie("token", token);
      await userModel.updateOne({
        $set: {
          isLoggedIn: true,
        },
      });
      return res.status(200).json({ message: "Login SuccessFul" });
    } else return res.status(400).json({ message: "Password is incorrect" });
  } catch (error) {
    console.log(`Error while login: ${error.message}`);
  }
}

//user logout
export async function logout(req, res) {
  try {
    res.cookie("token", "");
    await userModel.updateOne({
      $set: {
        isLoggedIn: false,
      },
    });
    return res.status(200).json({ message: "Logout successfully" });
  } catch {
    console.log(`Error while loggin out: ${error.message}`);
  }
}

//user dashboard
export async function dashboard(req, res) {
  if (!req.rootUser) {
    return res.status(404).json({ message: "Login First" });
  }

  res.status(200).json({ userName: req.rootUser.userName });
}

//forget password
export async function forgetpassword(req, res) {
  try {
    const verificationCode = Math.floor(
      Math.random() * 899999 + 100000
    ).toString();

    const title = "Reset Your Password";
    const heading = "Reset Your Password";
    const paragraph =
      "Please use the verification code below to reset your password:";
    const verificationCodeExpiry = Date.now() + 1 * 1000 * 60;
    const user = req.rootUser;
    if (!user) return res.status(404).json({ message: "Login First" });
    sendOtp(verificationCode, user.emailAddress, title, heading, paragraph);
    res.status(200).json({ verificationCode, verificationCodeExpiry });
  } catch (error) {
    console.log(`Error while sending otp: ${error.message}`);
  }
}

//reset password
export async function resetpassword(req, res) {
  const { emailAddress } = req.rootUser;
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await userModel.findOneAndUpdate(
      { emailAddress },
      { $set: { password: hashedPassword } }
    );
    res.status(200).json({ user });
  } catch (error) {
    console.log(`Error while resetting password: ${error.message}`);
  }
}

//update password
export async function updatepassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const passwordIsCorrect = await bcrypt.compare(
      currentPassword,
      req.rootUser.password
    );
    if (!passwordIsCorrect)
      return res.status(402).json({ message: "Password is incorrect" });
    const user = await userModel.findOneAndUpdate(
      {
        emailAddress: req.rootUser.emailAddress,
      },
      { $set: { password: hashedPassword } }
    );
    res.status(200).json({
      message: "Password updated successfully",
      currentPassword,
      newPassword,
    });
  } catch (error) {
    console.log(`Error while updating password: ${error.message}`);
  }
}

//update username
export async function updateusername(req, res) {
  try {
    const { newUserName } = req.body;
    const user = await userModel.findOneAndUpdate(
      {
        emailAddress: req.rootUser.emailAddress,
      },
      { $set: { userName: newUserName } }
    );
    res.status(200).json({
      message: "Username updated successfully",
      newUserName,
    });
  } catch (error) {
    console.log(`Error while updating username: ${error.message}`);
  }
}
