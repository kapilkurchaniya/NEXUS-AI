import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, 'Token is required'],
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 7 * 24 * 60 * 60 // Auto-delete after 7 days (matches JWT_EXPIRES_IN)
    }
});

const BlacklistModel = mongoose.model('blacklist', blacklistSchema);
export default BlacklistModel;