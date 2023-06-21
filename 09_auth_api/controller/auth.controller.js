const db = require('../db.js');
const bcrypt = require('bcrypt');
const jwtTokens = require('../jwt.helper.js')
const {validationResult} = require('express-validator');

class AuthController {
    async signUp(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({error: "Email should be email or password should be min 3 and max 32"});
            }

            const email = req.body.email;
            const users = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            if (users.rows.length !== 0) {
                return res.status(409).json(
                    {
                        success: "false",
                        error: "Email is already registered"
                    });
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const newUser = await db.query(
                'INSERT INTO users (email,password) VALUES ($1,$2) RETURNING *',
                [req.body.email, hashedPassword]);

            const token = jwtTokens(newUser.rows[0].id)

            await db.query(
                'INSERT INTO refreshtokens (refreshtoken) VALUES ($1) RETURNING *',
                [token.refreshToken]);

            res.status(201).json({
                success: 'true',
                data: {
                    id: newUser.rows[0].id,
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken
                }
            });
        } catch (e) {
            next(e)
        }
    }

    async signIn(req, res, next) {
        try {
            const {email, password} = req.body;

            const users = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            if (users.rows.length === 0) return res.status(404).json({error: "Email is not found"});

            const validPassword = await bcrypt.compare(password, users.rows[0].password);
            if (!validPassword) return res.status(404).json({error: "Password is not correct"});

            const token = jwtTokens(users.rows[0].id)

            await db.query(
                'INSERT INTO refreshtokens (refreshtoken) VALUES ($1) RETURNING *',
                [token.refreshToken]);

            res.status(201).json({
                success: 'true',
                data: {
                    id: users.rows[0].id,
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken
                }
            });
        } catch(e) {
            next(e);
        }
    }
}

module.exports = new AuthController()