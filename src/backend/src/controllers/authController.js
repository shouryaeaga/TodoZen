// Database Pool
const db = require("../database/db")
// Import argon 2
const argon2 = require("argon2")
// Import jwt
const jwt = require("jsonwebtoken")

// Import utility functions
const sendEmail = require("../utils/sendEmail")

const crypto = require("crypto")

// User sign up
const signUp = async (req, res) => {
    let {username, email, password} = req.body
    // If username, email, and password are not sent, return 400
    if (!username || !email || !password) {
        return res.status(400).json({msg:"Must send username, email and password"})
    }

    // Set email and username to lowercase
    email = email.toLowerCase()
    username = username.toLowerCase()
    
    try {
        const query = "SELECT * FROM users WHERE username = $1 OR email = $2"
        // Query to see if user already exists
        const result = await db.query(query, [username, email])
        if (result.rowCount > 0) {
            if (result.rows[0].email == email) {
                return res.status(400).json({msg:"Email already in use"})
            } else {
                return res.status(400).json({msg:"Username already in use"})
            }
        }
        // Insert user into database
        // Hash the password
        const hash = await argon2.hash(password)
        const insertQuery = "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)"
        db.query(insertQuery, [username, email, hash], (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({msg:err})
            }
            return res.status(201).json({msg:"User created"})
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({msg:err})
    }
}

// User login
const login = async (req, res) => {
    let {username, password} = req.body
    // If username and password are not sent, return 400
    if (!username ||!password) {
        return res.status(400).json({msg:"Must send username and password"})
    }

    // Convert username to lowercase
    username = username.toLowerCase()

    try {
        const user = await db.query("SELECT * FROM users WHERE username = $1", [username])


        if (user.rowCount == 0) {
            return res.status(401).json({msg:"Invalid username or password"})
        }
        
        // Check hash before checking if user exists, stops timing attack
        const passwordMatch = await argon2.verify(user.rows[0].password, password)

        // User does exist
        if (user.rowCount > 0) {
            if (passwordMatch) {
                // Create access and refresh tokens with expires in 15 minutes and 7 days
                const accessToken = jwt.sign({username: user.rows[0].username, type: "access"}, process.env.JWT_SECRET, {expiresIn: "15m"})
                const refreshToken = jwt.sign({username: user.rows[0].username, type: "refresh"}, process.env.JWT_SECRET, {expiresIn: "7d"})
                // Set refresh token in database
                const updateQuery = "UPDATE users SET refresh_token = $1 WHERE username = $2"
                db.query(updateQuery, [refreshToken, username], (err, result) => {
                    if (err) {
                        return res.status(500).json({msg:err})
                    }
                    // Set cookie
                    res.cookie("access_token", accessToken, {sameSite: "lax", httpOnly: true, maxAge: 1000 * 60 * 15})
                    res.cookie("refresh_token", refreshToken, {sameSite: "lax", httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7})
                    return res.status(200).json({msg:"Login successful"})
                })
            } else {
                // Check if password is wrong
                return res.status(401).json({msg:"Invalid username or password"})
            }
        } else {
            // User does not exist
            return res.status(401).json({msg:"Invalid username or password"})
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({msg:err})
    }
    
}

// Refresh token
const refreshToken = async (req, res) => {
    const refresh_token = req.cookies.refresh_token
    if (!refresh_token) {
        return res.status(401).json({msg:"Refresh token not found"})
    }
    
    // Check if refresh token is same as in database
    const databaseRefreshToken = await db.query("SELECT * FROM users WHERE refresh_token = $1", [refresh_token])
    if (databaseRefreshToken.rowCount === 0) {
        return res.status(401).json({msg:"Invalid refresh token"})
    }
    const user = databaseRefreshToken.rows[0]

    // Verify refresh token
    try {
        const {username, type} = await jwt.verify(refresh_token, process.env.JWT_SECRET)
        if (!username || !type === 'refresh') {
            return res.status(401).json({msg:"Invalid refresh token"})
        }
        // Create access and refresh tokens with expires in 15 minutes and 7 days
        const accessToken = jwt.sign({username: username, type: "access"}, process.env.JWT_SECRET, {expiresIn: "15m"})
        const refreshToken = jwt.sign({username: username, type: "refresh"}, process.env.JWT_SECRET, {expiresIn: "7d"})
        
        // Set refresh token in database
        const updateQuery = "UPDATE users SET refresh_token = $1 WHERE username = $2"
        db.query(updateQuery, [refreshToken, username], (err, result) => {
            if (err) {
                return res.status(500).json({msg:err})
            }
            res.cookie("access_token", accessToken, {sameSite: "lax", httpOnly: true, maxAge: 1000 * 60 * 15})
            res.cookie('refresh_token', refreshToken, {sameSite: "lax", httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7})
            return res.status(200).json({
                msg : "Refreshed tokens",
                user: user
            })
        })
    } catch (err) {
        return res.status(500).send(err)
    }
}

const logout = (req, res) => {
    res.clearCookie("access_token")
    res.clearCookie("refresh_token")
    res.status(200).json({msg:"Logged out"})
}

const forgotPassword = async (req, res) => {
    const {email} = req.body
    if (!email) {
        return res.status(400).json({msg:"Must send email"})
    }
    try {
        const query = "SELECT * FROM users WHERE email = $1"
        const results = await db.query(query, [email])

        if (results.rowCount == 0) {
            return res.status(400).json({msg:"Invalid email"})
        }

        const password_token = crypto.randomBytes(32).toString("hex")

        const insertQuery = "UPDATE users SET password_token = $1 WHERE email = $2"
        const insertResults = await db.query(insertQuery, [password_token, email])
        sendEmail(process.env.EMAIL_FROM, email, "Password Reset", `Password reset link: http://${process.env.FRONTEND_URL}/auth/password-reset?user_id=${results.rows[0].id}&token=${password_token}`)
        return res.status(200).json({msg:"Password reset link sent"})
    } catch (err) {
        console.log(err)
        return res.status(500).json({msg:err})
    }
    

}

const resetPassword = async (req, res) => {
    const password = req.body.password
    if (!password) {
        return res.status(400).json({msg:"Must send password"})
    }
    
    try {
        const token = req.params.token
        const user_id = req.params.user_id
        const user = await db.query("SELECT * FROM users WHERE password_token = $1", [token])
        if (user.rows[0].id !== user_id) {
            return res.status(400).json({msg:"User not found"})
        }

        const hashed_password = await argon2.hash(password)
        const updateQuery = "UPDATE users SET password = $1, password_token=NULL WHERE id = $2"
        const updateResults = await db.query(updateQuery, [hashed_password, user_id])

        
        return res.status(200).json({msg:"Password updated"})
    } catch (err) {
        console.log(err)
        return res.status(500).json({msg:err})
    }
}

module.exports = {signUp, login, refreshToken, logout, forgotPassword, resetPassword}