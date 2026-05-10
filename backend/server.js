import dotenv from "dotenv";
import express from "express";
dotenv.config();
import app from './src/app.js';
import connectDB from './src/config/database.js';
import http from 'http';
import { initSocket } from "./src/sockets/server.socket.js";

const httpServer = http.createServer(app);
initSocket(httpServer);
app.use(express.json());
await connectDB();

httpServer.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
