import { Router } from "express";
import { sendMessage } from "../controllers/chat.controller.js";
import { verifyuser } from "../middlewares/authmiddleware.js";

const chatRouter = Router();

chatRouter.post("/message", verifyuser, sendMessage);

export default chatRouter;