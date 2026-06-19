import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'New Chat'
    },
    type: {
        type: String,
        enum: ['website', 'document'],
        required: true
    },
    collectionName: {
        type: String, // The ChromaDB collection linked to this chat
        required: true
    },
    source: {
        type: String // The URL or filename
    },
    messages: [
        {
            role: { type: String, enum: ['user', 'assistant'] },
            text: { type: String },
            sources: [String], // Array of URLs or references
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;
