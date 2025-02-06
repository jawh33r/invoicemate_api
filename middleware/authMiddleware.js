const jwt = require('jsonwebtoken');
const UserLogin = require('../models/UserLogin');

const authenticateJWT = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await UserLogin.findByPk(decoded.userId, {
            attributes: ['id', 'username']
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid user' });
        }

        req.user = {
            id: user.id,
            username: user.username
        };

        next();
    } catch (err) {
        console.error('Auth Error:', err.message);
        const response = {
            error: 'Forbidden'
        };
        if (process.env.NODE_ENV === 'development') {
            response.details = err.message;
        }
        return res.status(403).json(response);
    }
};

module.exports = authenticateJWT;