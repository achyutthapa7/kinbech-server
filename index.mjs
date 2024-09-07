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

app.use("/image", express.static("./public/my-uploads"));

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5173",
      "https://kinbech-client.vercel.app",
      "https://www.achyutthapa.com.np",
      "https://kinbech-client-krxtkj7lj-achyutthapa7s-projects.vercel.app"
    ],
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.options("*", cors());

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/", router);
app.listen(port, (req, res) => {
  console.log(`Server is live at`);
});

app.get("/", (req, res) => res.send("Express on Vercel"));
