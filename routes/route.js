import express from "express";
import { registration, login } from "../controllers/controller.js";
const router = express.Router();

router.get("/registration", registration);
router.get("/login", login);
export { router };
