import "../conn/conn.js";
import sendOtp from "../helpers/sendOtp.js";
import { userModel } from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cron from "node-cron";

//schedule verification code to be deleted
cron.schedule("*/5 * * * *", async (req, res) => {
  try {
    const now = Date.now();
    const result = await userModel.deleteMany({
      isVerified: false,
      verificationCodeExpiry: { $lt: now },
    });
    if (result.deletedCount > 0) {
      console.log(
        `Deleted ${result.deletedCount} unverified users with expired verification codes.`
      );
    }
  } catch (error) {
    console.error(`Error while deleting unverified users: ${error.message}`);
  }
});

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
    const userExistByEmailAddress = await userModel
      .findOne({ emailAddress })
      .lean();
    const userExistByUserName = await userModel.findOne({ userName }).lean();
    if (userExistByEmailAddress)
      return res
        .status(401)
        .json({ message: "Email address already exist, try another" });
    if (userExistByUserName)
      return res.status(402).json({ message: "User name should be unique" });
    const verificationCode = Math.floor(
      Math.random() * 899999 + 100000
    ).toString();
    const verificationCodeExpiry = Date.now() + 5 * 1000 * 60;
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
    res.cookie("emailAddress", emailAddress);
    await newUser.save();

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
    if (verificationCode === user.verificationCode) {
      res.cookie("emailAddress", "");
      await userModel.updateOne(
        { emailAddress },
        {
          $set: {
            isVerified: true,
          },
        }
      );

      return res.status(200).json({ message: "Verification successful" });
    } else {
      return res.status(401).json({ message: "Verification code is wrong" });
    }
  } catch (error) {
    console.log(`Error while verifying: ${error.message}`);
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
      res.cookie("token", token, {
        maxAge: 3 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      await userModel.findOneAndUpdate(
        {
          userName,
        },
        {
          $set: { isLoggedIn: true },
        }
      );
      return res.status(200).json({
        message: "Login SuccessFul",
        user: userExistByUserName,
        token,
      });
    } else return res.status(400).json({ message: "Password is incorrect" });
  } catch (error) {
    console.log(`Error while login: ${error.message}`);
  }
}

//user logout
export async function logout(req, res) {
  try {
    const { emailAddress } = req.rootUser;
    res.cookie("token", "");
    await userModel.findOneAndUpdate(
      { emailAddress },
      { $set: { isLoggedIn: false } }
    );
    return res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    console.log(`Error while logging out: ${error.message}`);
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
    const verificationCodeExpiry = Date.now() + 5 * 1000 * 60;
    const user = req.rootUser;
    if (!user) return res.status(404).json({ message: "Login First" });
    sendOtp(verificationCode, user.emailAddress, title, heading, paragraph);
    res.status(200).json({ verificationCode, verificationCodeExpiry });
  } catch (error) {
    console.log(`Error while sending otp: ${error.message}`);
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
      { $set: { userName: newUserName } },
      { new: true }
    );

    res.status(200).json({
      message: "Username updated successfully",
      user,
    });
  } catch (error) {
    console.log(`Error while updating username: ${error.message}`);
  }
}

//get emailaddress
export async function isauthenticated(req, res) {
  try {
    return res.status(200).json({ user: req.rootUser });
  } catch (error) {
    console.log(`error: ${error.message}`);
  }
}

export async function isverified(req, res) {
  try {
    return res.status(200).json({ user: req.rootUser });
  } catch (error) {
    console.log(`error: ${error.message}`);
  }
}
