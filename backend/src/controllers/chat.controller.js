import {
    generateResponse,
    generateChatTitle
} from "../services/ai.service.js";

import ChatModel from "../models/chat.model.js";
import MessageModel from "../models/message.model.js";

import {
    HumanMessage,
    AIMessage
} from "@langchain/core/messages";

export async function sendMessage(req, res) {

    try {

        const { message, chatId } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        let chat;
        let chatTitle = "";

        // CREATE NEW CHAT
        if (!chatId) {

            chatTitle = message.substring(0, 30);

            chat = await ChatModel.create({
                user: req.user.id,
                title: chatTitle
            });

        } else {

            // FIND EXISTING CHAT
            chat = await ChatModel.findById(chatId);

            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
            }
        }

        // GET OLD CHAT MESSAGES
        const oldMessages = await MessageModel
            .find({ chat: chat._id })
            .sort({ createdAt: 1 });

        // CONVERT DB MESSAGES → LANGCHAIN MESSAGES
        const formattedMessages = [];

        for (const msg of oldMessages) {

            if (msg.role === "user") {

                formattedMessages.push(
                    new HumanMessage(msg.content)
                );

            } else {

                formattedMessages.push(
                    new AIMessage(msg.content)
                );
            }
        }

        // ADD CURRENT USER MESSAGE
        formattedMessages.push(
            new HumanMessage(message)
        );

        // GENERATE AI RESPONSE WITH CONTEXT
        const aiResponse = await generateResponse(formattedMessages);

        // SAVE USER MESSAGE
        await MessageModel.create({
            chat: chat._id,
            content: message,
            role: "user"
        });

        // SAVE AI MESSAGE
        await MessageModel.create({
            chat: chat._id,
            content: aiResponse,
            role: "ai"
        });

        res.status(200).json({
            success: true,
            title: chat.title,
            chatId: chat._id,
            message: aiResponse
        });

    } catch (error) {

        console.log("Error in sendMessage controller:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}