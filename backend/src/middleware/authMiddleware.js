import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({ error: 'Not authorized, user not found' });
            }

            // Daily Token Reset Check (10 tokens per day)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastReset = user.lastTokenReset ? new Date(user.lastTokenReset) : null;
            if (!lastReset || lastReset < today) {
                user.tokens = 10;
                user.lastTokenReset = new Date();
                await user.save();
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    } else {
        // Fallback for development if mongo is not configured
        if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongo_db_uri_here') {
             // Mock user for dev without DB
             req.user = { _id: 'dev_user', email: 'dev@test.com', tokens: 999 };
             return next();
        }

        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

export default protect;
