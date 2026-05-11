import { Router } from "express";
import { sendMessage , getChats, getMessages , deleteChat} from "../controllers/chat.controller.js";
import { verifyuser } from "../middlewares/authmiddleware.js";

const chatRouter = Router();

chatRouter.post("/message", verifyuser, sendMessage);

chatRouter.get("/", verifyuser, getChats);

chatRouter.get("/:chatId/messages", verifyuser, getMessages);

chatRouter.delete("/delete/:chatId", verifyuser, deleteChat);

export default chatRouter;