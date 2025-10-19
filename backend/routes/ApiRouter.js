
import express from "express";
import { test } from "../controllers/ApiController.js";

const ApiRouter = express.Router();

ApiRouter.post("/send", test);


ApiRouter.get("/health", (req, res) => {
  res.json({ status: "API is healthy" });
});

ApiRouter.get("/gay", (req, res) => {
  res.json({ message: "You found the secret endpoint!" });
});

ApiRouter.get("/lesbian", (req, res) => {
  res.json({ message: "You found the secret endpoint!" });
});

export default ApiRouter;
