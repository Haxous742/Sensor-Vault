import express from "express";
import { test } from "../controllers/ApiController.js";
import { login } from "../controllers/ApiController.js";
import { verify } from "../controllers/ApiController.js";
import { start } from "../controllers/ApiController.js";
import { stop } from "../controllers/ApiController.js";
import { getTeams } from "../controllers/ApiController.js";
import { task1 } from "../controllers/ApiController.js";
import { task2 } from "../controllers/ApiController.js";
import { task3 } from "../controllers/ApiController.js";
import { task4 } from "../controllers/ApiController.js";
import { task1edit } from "../controllers/ApiController.js";
import { task2edit } from "../controllers/ApiController.js";
import { task3edit } from "../controllers/ApiController.js";
import { task4edit } from "../controllers/ApiController.js";
import { teamProgress } from "../controllers/ApiController.js";
import { leaderboard } from "../controllers/ApiController.js";
import { task1Current } from "../controllers/ApiController.js";
import { task2Current } from "../controllers/ApiController.js";
import { task3Current } from "../controllers/ApiController.js";
import { task4Current } from "../controllers/ApiController.js";

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

ApiRouter.post("/task1", task1);

ApiRouter.post("/task2", task2);

ApiRouter.post("/task3", task3);

ApiRouter.post("/task4", task4);

ApiRouter.post("/task1/edit", task1edit);

ApiRouter.post("/task2/edit", task2edit);

ApiRouter.post("/task3/edit", task3edit);

ApiRouter.post("/task4/edit", task4edit);

ApiRouter.get("/task1/current", task1Current);

ApiRouter.get("/task2/current", task2Current);

ApiRouter.get("/task3/current", task3Current);

ApiRouter.get("/task4/current", task4Current);

ApiRouter.get("/teamProgress", teamProgress);

ApiRouter.get("/leaderboard", leaderboard);

export default ApiRouter;
