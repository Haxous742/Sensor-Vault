
import express from "express";

const IOTRouter = express.Router();

IOTRouter.get("/health", (req, res) => {
  res.json({ status: "IOT API is healthy" });
});

IOTRouter.post("/taskarrows", (req, res) => {
  res.json({ status: "Task 1 is running" });
});

IOTRouter.post("/taskdistance", (req, res) => {
  res.json({ status: "Task 2 is running" });
});

IOTRouter.post("/taskmorse", (req, res) => {
  res.json({ status: "Task 3 is running" });
});

IOTRouter.post("/taskmagnetic", (req, res) => {
  res.json({ status: "Task 4 is running" });
});

export default IOTRouter;
