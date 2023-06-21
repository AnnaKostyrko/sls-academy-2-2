const Router = require('express')
const router = new Router()
const userController = require('../controller/user.controller')
const authController = require('../controller/auth.controller')
const authenticateToken = require("../middlewares/auth.middleware");
const {body} = require('express-validator')

router.get('/me', authenticateToken, userController.getMe)
router.post('/auth/sign-up',
    body('email').isEmail(),
    body('password').isLength({min:3, max:32}),
    authController.signUp)
router.post('/auth/sign-in', authController.signIn)

module.exports = router