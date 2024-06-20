import "./conn/conn.js";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { router } from "./routes/route.js";
const app = express();
const port = process.env.PORT || 3000;

//middlewares

app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", router);
app.listen(port, () => {
  console.log(`Server is live at: http://localhost:${port}`);
});
