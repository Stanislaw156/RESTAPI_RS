const jwt = require('jsonwebtoken');
require('dotenv').config(); 

module.exports = function(req, res, next) {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ msg: 'Token error, format should be \'Bearer <token>\'' });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.jwtUserSecret);
        console.log(decoded);
        
        if (decoded.user && decoded.user.id) {
            req.user = {
                id: decoded.user.id,
                name: decoded.user.name 
            };
        } else {
            req.user = {
                id: decoded.id,
                name: decoded.name
            };
        }
        
        next();
    } catch (err) {
        console.error('Something went wrong with the auth middleware:', err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token expired, please login again' });
        } else {
            return res.status(401).json({ msg: 'Token is not valid' });
        }
    }
}