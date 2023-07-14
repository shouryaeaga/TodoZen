const router = require("express").Router()
const authMiddleware = require("../middleware/authMiddleware/authorizationPermission")
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

// Change username route
router.post("/change-username", authMiddleware.regularUserPermission, authController.change_username)

// Logged in user change password
router.post("/change-password", authMiddleware.regularUserPermission, authController.change_password)

// Logged in user changing email
router.post("/change-email", authMiddleware.regularUserPermission, authController.change_email)


module.exports = router