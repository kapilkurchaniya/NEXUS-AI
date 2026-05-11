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
            // Generate a proper title using Mistral AI based on first user prompt
            const generated = await generateChatTitle(message);
            chatTitle = String(generated ?? "New Chat")
                .replace(/^\s*['"]|['"]\s*$/g, "")
                .replace(/\s+/g, " ")
                .trim();
            chatTitle = chatTitle.length > 60 ? chatTitle.slice(0, 60).trim() : chatTitle;

            chat = await ChatModel.create({
                user: req.user.id,
                title: chatTitle || "New Chat"
            });
        } else {
            // FIND EXISTING CHAT (must belong to user)
            chat = await ChatModel.findOne({ _id: chatId, user: req.user.id });
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

export async function getChats(req, res) {
    const user = req.user.id;

    const chats = await ChatModel.find({ user }).sort({ createdAt: -1 });

    // Attach a preview for each thread (latest message)
    const chatsWithPreview = await Promise.all(
        chats.map(async (c) => {
            const lastMessage = await MessageModel.findOne({ chat: c._id })
                .sort({ createdAt: -1 });
            return {
                ...c.toObject(),
                lastMessage: lastMessage?.content || c.title,
            };
        })
    );

    res.status(200).json({
        success: true,
        chats: chatsWithPreview,
    });
}  


export async function getMessages(req, res) {

    const { chatId } = req.params;

    const chat = await ChatModel.findOne({ _id: chatId, user: req.user.id });
    if (!chat) {
        return res.status(404).json({
            success: false,
            message: "Chat not found"
        });
    }


    const messages = await MessageModel.find({ chat: chatId }).sort({ createdAt: 1 });

    res.status(200).json({
        success: true,
        title: chat.title,
        chatId: chat._id,
        messages
    });
}

export async function deleteChat(req, res) {

    const { chatId } = req.params;

    const chat = await ChatModel.findOne({ _id: chatId, user: req.user.id });
    if (!chat) {
        return res.status(404).json({
            success: false,
            message: "Chat not found"
        });
    }

    await MessageModel.deleteMany({ chat: chatId });
    await ChatModel.findByIdAndDelete(chatId);

    res.status(200).json({
        success: true,
        message: "Chat deleted successfully"
    });
}