import express from 'express';
import ChatSession from '../models/ChatSession.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/sessions
// @desc    Get all chat sessions for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        if (!req.user || req.user._id === 'dev_user') return res.json([]);
        
        const sessions = await ChatSession.find({ userId: req.user._id })
            .select('-messages') // Don't fetch all messages for the list
            .sort({ updatedAt: -1 });
            
        res.json(sessions);
    } catch (error) {
        console.error('Fetch sessions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/sessions/:id
// @desc    Get a specific chat session with messages
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        if (!req.user || req.user._id === 'dev_user') return res.status(401).json({ error: 'Not authorized' });

        const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        console.error('Fetch session error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/sessions
// @desc    Create a new chat session
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        if (!req.user || req.user._id === 'dev_user') return res.status(401).json({ error: 'Not authorized' });

        const { title, type, collectionName, source } = req.body;

        if (!type || !collectionName) {
             return res.status(400).json({ error: 'Type and collectionName are required' });
        }

        const session = await ChatSession.create({
            userId: req.user._id,
            title: title || 'New Chat',
            type,
            collectionName,
            source,
            messages: []
        });

        res.status(201).json(session);
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete a session
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        if (!req.user || req.user._id === 'dev_user') return res.status(401).json({ error: 'Not authorized' });
        await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.json({ success: true });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
