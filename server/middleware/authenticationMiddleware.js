const jwt = require('jsonwebtoken');
const User = require('../config/models/user');

async function authenticationMiddleware(req, res, next) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            return res.status(401).send('Unauthorized');
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            return res.status(401).send('Unauthorized');
        }

        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        console.error(error);
        res.status(401).send('Unauthorized');
    }
}

module.exports = authenticationMiddleware;
