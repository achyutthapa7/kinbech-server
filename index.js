import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { router } from "./routes/route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "https://kinbech.vercel.app"],
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options("*", cors());

// Define routes
app.use("/", router);

// Start the server with increased timeout
const server = app.listen(port, () => {
  console.log(`Server is live at: http://localhost:${port}`);
});
server.setTimeout(500000); // Set timeout to 500 seconds
