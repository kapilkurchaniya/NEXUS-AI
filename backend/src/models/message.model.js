import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'ai'],
    default: 'user',
  },
  images: [{
    data: { type: String },
    mimeType: { type: String },
    name: { type: String },
  }],
}, {
  timestamps: true,
});

const MessageModel = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default MessageModel;
