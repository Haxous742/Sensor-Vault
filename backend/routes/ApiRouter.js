
import express from "express";
import { test } from "../controllers/ApiController.js";
import { login } from "../controllers/ApiController.js";

const ApiRouter = express.Router();

ApiRouter.post("/send", test);


ApiRouter.get("/health", (req, res) => {
  res.json({ status: "API is healthy" });
});

ApiRouter.get("/gay", (req, res) => {
  res.json({ message: "You found the secret endpoint!" });
});

ApiRouter.get("/trans", (req, res) => {
  res.json({ message: "You found the secret trans endpoint!" });
});


ApiRouter.get("/lesbian", (req, res) => {
  res.json({ message: "You found the secret endpoint!" });
});


// rounter for handling login
ApiRouter.post("/login", login);

export default ApiRouter;
