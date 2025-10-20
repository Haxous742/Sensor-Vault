
import express from "express";

const IOTRouter = express.Router();

IOTRouter.get("/health", (req, res) => {
  res.json({ status: "IOT API is healthy" });
});

IOTRouter.post("/task1", (req, res) => {
  res.json({ status: "Task 1 is running" });
});

IOTRouter.post("/task2", (req, res) => {
  res.json({ status: "Task 2 is running" });
});

IOTRouter.post("/task3", (req, res) => {
  res.json({ status: "Task 3 is running" });
});

IOTRouter.post("/task4", (req, res) => {
  res.json({ status: "Task 4 is running" });
});

export default IOTRouter;
