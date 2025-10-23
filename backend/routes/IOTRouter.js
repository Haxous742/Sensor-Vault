import express from "express";



import { taskArrowsController } from "../controllers/IOTController.js";
import { taskDistanceController } from "../controllers/IOTController.js";
import { taskMorseController } from "../controllers/IOTController.js";
import { taskMagneticController } from "../controllers/IOTController.js";
import { CheckAuthIOT } from "../middlewares/CheckAuthIOT.js";




const IOTRouter = express.Router();

IOTRouter.get("/health", (req, res) => {
  res.json({ status: "IOT API is healthy" });
});

IOTRouter.post("/taskarrows", CheckAuthIOT, taskArrowsController);

IOTRouter.post("/taskdistance", CheckAuthIOT, taskDistanceController);

IOTRouter.post("/taskmorse", CheckAuthIOT, taskMorseController);

IOTRouter.post("/taskmagnetic", CheckAuthIOT, taskMagneticController);

export default IOTRouter;
