const router = require("express").Router()
// Import controllers
const authController = require("../controllers/authController")


// User signup route
router.post("/signup", authController.signUp)

// User login route
router.post("/login", authController.login)

// User refresh token route
router.post("/refresh", authController.refreshToken)

// User logout route
router.post("/logout", authController.logout)

// User forgot password route
router.post("/forgot-password", authController.forgotPassword)

// User reset password route
router.post("/forgot-password/:user_id/:token", authController.resetPassword)

module.exports = router