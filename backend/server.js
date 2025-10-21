// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import http from "http";
import { initSocket } from "./socket/socket.js";
import ApiRouter from "./routes/ApiRouter.js";
import cookieParser from "cookie-parser";
import IOTRouter from "./routes/IOTRouter.js";
import cors from "cors";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(cookieParser()); // middle cookie parser

app.use(express.json()); // this middleware will parse JSON bodies: req.body
app.use(express.urlencoded({ extended: true }));

// Example API route


app.use("/api/iot", IOTRouter);
app.use("/api", ApiRouter);

//cors policy
app.use(
  cors({
    origin: ["http://localhost:5173","https://www.sensorvault.live"],
    methods: ["GET", "POST"],
    credentials: true, //
  })
);


// 🧩 Create HTTP server and init Socket.IO
const server = http.createServer(app);
const io = initSocket(server); // Initialize socket & store globally

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("✅ Server started on PORT:", PORT);
  });
});

export { io };
