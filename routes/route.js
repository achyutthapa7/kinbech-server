import express from "express";
import {
  registration,
  login,
  verification,
  dashboard,
  logout,
  updatepassword,
  resetpassword,
  updateusername,
  forgetpassword,
} from "../controllers/controller.js";
import authentication from "../auth/auth.js";
const router = express.Router();

router.post("/registration", registration);
router.post("/login", login);
router.post("/verification", verification);
router.get("/dashboard", authentication, dashboard);
router.get("/logout", logout);
router.post("/forgetpassword", authentication, forgetpassword);
router.post("/updatepassword", authentication, updatepassword);
router.post("/resetpassword", authentication, resetpassword);
router.post("/updateusername", authentication, updateusername);
export { router };
