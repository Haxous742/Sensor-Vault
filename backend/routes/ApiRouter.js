import express from "express";
import { test } from "../controllers/ApiController.js";
import { login } from "../controllers/ApiController.js";
import { verify } from "../controllers/ApiController.js";
import { start } from "../controllers/ApiController.js";
import { stop } from "../controllers/ApiController.js";
import { getTeams } from "../controllers/ApiController.js";

const ApiRouter = express.Router();

ApiRouter.post("/send", test);

ApiRouter.get("/health", (req, res) => {
  res.json({ status: "API is healthy" });
});

// rounter for handling login
ApiRouter.post("/login", login);

// router to verify the cookie
ApiRouter.get("/verify", verify);

// to start the timer in the backend
ApiRouter.post("/start", start);

// to stop the time in the backend
ApiRouter.post("/stop", stop);

ApiRouter.get("/getTeams", getTeams);

export default ApiRouter;
