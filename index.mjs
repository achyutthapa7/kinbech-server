import "./conn/conn.js";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { router } from "./routes/route.js";
import { fetchAllProduct } from "./controllers/product.controller.js";
const app = express();
const port = process.env.PORT || 3000;

//middlewares

app.use("/image", express.static("./public/my-uploads"));

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173"],
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.options("*", cors());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", router);
app.get("/fetch", fetchAllProduct);
app.listen(port, () => {
  console.log(`Server is live at: http://localhost:${port}`);
});

app.get("/", (req, res) => res.send("Express on Vercel"));
