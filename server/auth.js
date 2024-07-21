const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Drop the 'Bearer' part
    if (token === null)
        return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log(err);

            res.sendStatus(403)
            return;
        }

        req.username = user.username;
        next();
    });
}