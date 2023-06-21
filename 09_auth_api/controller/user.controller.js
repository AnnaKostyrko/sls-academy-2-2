const db = require("../db");

class UserController {

    async getMe(req, res) {
        const users = await db.query('SELECT * FROM users WHERE id = $1', [req.userId]);
        if (users.rows.length === 0) {
            return res.status(404).json({error:"User is not found"});
        }
        const currentUser = users.rows[0];
        res.json({
            success: 'true',
            data: {
                id: currentUser.id,
                email: currentUser.email,
            }
        })
    }
}

module.exports = new UserController()