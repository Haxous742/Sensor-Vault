
import express from "express";
import { test } from "../controllers/ApiController.js";
import { login } from "../controllers/ApiController.js";
import { verify } from "../controllers/ApiController.js";

const ApiRouter = express.Router();

ApiRouter.post("/send", test);

ApiRouter.get("/health", (req, res) => {
  res.json({ status: "API is healthy" });
});

// rounter for handling login
ApiRouter.post("/login", login);

// router to verify the cookie
ApiRouter.get("/verify", verify);

export default ApiRouter;
