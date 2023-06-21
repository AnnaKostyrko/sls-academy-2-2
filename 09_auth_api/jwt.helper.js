const jwt = require('jsonwebtoken')

function jwtTokens(id) {
    const user = { id };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TTL });
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    return ({ accessToken, refreshToken });
}

module.exports = jwtTokens