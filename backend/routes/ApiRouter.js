
import express from "express";
import { test } from "../controllers/ApiController.js";

const ApiRouter = express.Router();

ApiRouter.post("/send", test);


ApiRouter.get("/health", (req, res) => {
  res.json({ status: "API is healthy" });
});

export default ApiRouter;
