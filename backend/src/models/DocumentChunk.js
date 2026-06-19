import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema({
    collectionName: {
        type: String,
        required: true,
        index: true
    },
    text: {
        type: String,
        required: true
    },
    embedding: {
        type: [Number],
        required: true
    },
    url: {
        type: String
    }
}, {
    timestamps: true
});

const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);

export default DocumentChunk;
