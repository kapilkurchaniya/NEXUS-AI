import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import BlacklistModel from "../models/blacklistModel.js";

 
export async function verifyuser(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        // Check if token has been blacklisted (user logged out)
        const isBlacklisted = await BlacklistModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: "Token has been invalidated. Please login again." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); 

    }
    catch (error) { 
        return res.status(401).json({ message: "Invalid token" });
    }
}
