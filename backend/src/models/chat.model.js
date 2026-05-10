import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    trim: true,
    default: 'New Chat',
  },
}, {
  timestamps: true,
});

const ChatModel = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
export default ChatModel;
