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
                return res.status(500).json({msg:"There was an error, please contact support@shouryaeaga.com"})
            }
            return res.status(201).json({msg:"User created"})
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({msg:"There was an error, please contact support@shouryaeaga.com"})
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
            console.log('here: line 69')
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
                        return res.status(500).json({msg:"There was an error, please contact support@shouryaeaga.com"})
                    }
                    // Set cookie
                    res.cookie("access_token", accessToken, {sameSite: "lax", httpOnly: true, maxAge: 1000 * 60 * 15})
                    res.cookie("refresh_token", refreshToken, {sameSite: "lax", httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7})
                    return res.status(200).json({msg:"Login successful"})
                })
            } else {
                // Check if password is wrong
                console.log('here: line 95')
                return res.status(401).json({msg:"Invalid username or password"})
            }
        } else {
            // User does not exist
            console.log('here: line 100')
            return res.status(401).json({msg:"Invalid username or password"})
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({msg:"There was an error, please contact support@shouryaeaga.com"})
    }
    
}

// Refresh token
const refreshToken = async (req, res) => {
    const refresh_token = req.cookies.refresh_token
    if (!refresh_token) {
        return res.status(401).json({msg:"Refresh token not found"})
    }
    
    // Check if refresh token is same as in database
    try {
        
        const databaseRefreshToken = await db.query("SELECT * FROM users WHERE refresh_token = $1", [refresh_token])
        if (databaseRefreshToken.rowCount === 0) {
            return res.status(401).json({msg:"Invalid refresh token"})
        }
        const user = databaseRefreshToken.rows[0]
        
        // Verify refresh token
        try {
            const {username, type} = await jwt.verify(refresh_token, process.env.JWT_SECRET)
            if (!username || type !== 'refresh') {
                return res.status(401).json({msg:"Invalid refresh token"})
            }
            // Create access and refresh tokens with expires in 15 minutes and 7 days
            const newAccessToken = jwt.sign({username: username, type: "access"}, process.env.JWT_SECRET, {expiresIn: "15m"})
            const newRefreshToken = jwt.sign({username: username, type: "refresh"}, process.env.JWT_SECRET, {expiresIn: "7d"})

            // Set refresh token in database
            const updateQuery = "UPDATE users SET refresh_token = $1 WHERE username = $2"
            db.query(updateQuery, [newRefreshToken, username], (err, result) => {
                if (err) {
                    return res.status(500).json({msg:err})
                }
                res.cookie("access_token", newAccessToken, {sameSite: "lax", httpOnly: true, maxAge: 1000 * 60 * 15})
                res.cookie('refresh_token', newRefreshToken, {sameSite: "lax", httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7})
                return res.status(200).json({
                    msg : "Refreshed tokens",
                    user: user
                })
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({msg:"There was an error, please contact support@shouryaeaga.com"})
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({msg:"There was an error, please contact support@shouryaeaga.com"})
    }

    
}

const logout = (req, res) => {
    res.clearCookie("access_token")
    res.clearCookie("refresh_token")
    res.status(200).json({msg:"Logged out"})
}

const forgotPassword = async (req, res) => {
    let {email} = req.body
    if (!email) {
        return res.status(400).json({msg:"Must send email"})
    }
    email = email.toLowerCase()
    try {
        const query = "SELECT * FROM users WHERE email = $1"
        const results = await db.query(query, [email])

        if (results.rowCount == 0) {
            return res.status(400).json({msg:"Invalid email"})
        }

        const password_token = crypto.randomBytes(32).toString("hex")

        const insertQuery = "UPDATE users SET password_token = $1 WHERE email = $2"
        const insertResults = await db.query(insertQuery, [password_token, email])
        const template = `
        <h1 style="font-family: 'Segoe UI'; text-align: center">
          TodoZen
        </h1>
        <div style="border: solid 1px lightgray; padding: 10px; border-radius: 5px">
          <h2 style="font-family: 'Segoe UI'; text-align: center;">Hello ${results.rows[0].username}</h2>
          <h3 style="font-family: 'Segoe UI'; text-align: center; " >A request to reset your password for your TodoZen account has been sent</h3>
          <h4 style="font-family: 'Segoe UI'; text-align: center; margin-bottom: 40px;">Click here to reset your password</h4>
          <p style="text-align: center">
            <a style="font-family: 'Segoe UI'; font-size: 20px; text-decoration: none; border-radius: 10px; text-align: center; padding: 15px; color: white; background-color: #008CBA;" href="http://${process.env.FRONTEND_URL}/auth/password-reset?user_id=${results.rows[0].id}&token=${password_token}">Reset Your Password</a>
          </p>
          <p style="margin-top: 30px; text-align: center; font-family: 'Segoe UI'">
              If you didn't request this email, then can you safely ignore it
          </p>
        </div>
          <footer>
          <p style="text-align: center;">
            <small>
            Contact: support@shouryaeaga.com
            </small>
          </p>
          </footer>
        `
        sendEmail(process.env.EMAIL_FROM, email, "Password Reset", template)
        return res.status(200).json({msg:"Password reset link sent if email exists"})
    } catch (err) {
        console.log(err)
        return res.status(500).json({msg:"There was an error, please contact support@shouryaeaga.com"})
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
        console.log(user)
        if (user.rows.length === 0 || user.rows[0].id !== user_id) {
            return res.status(400).json({msg:"User or token not found"})
        }

        const hashed_password = await argon2.hash(password)
        const updateQuery = "UPDATE users SET password = $1, password_token=NULL, refresh_token=NULL WHERE id = $2"
        const updateResults = await db.query(updateQuery, [hashed_password, user_id])
        return res.status(200).json({msg:"Password updated"})
    } catch (err) {
        console.log(err)
        return res.status(500).json({msg:"There was an error, please contact support@shouryaeaga.com"})
    }
}

const change_username = (req, res) => {
    const new_username = req.body.username
    if (!new_username) {
        return res.status(400).json({msg: "Must send new username"})
    }

    const user_id = req.user.id

    const query = "UPDATE users SET username=$1 WHERE id=$2"
    db.query(query, [new_username.toLowerCase(), user_id], (error, results) => {
        if (error) {
            return res.status(500).json({msg: "There was an error, please contact shourya.eaga.09@gmail.com"})
        }
        const newAccessToken = jwt.sign({username: new_username, type: "access"}, process.env.JWT_SECRET, {expiresIn: "15m"})
        const newRefreshToken = jwt.sign({username: new_username, type: "refresh"}, process.env.JWT_SECRET, {expiresIn: "7d"})
        db.query("UPDATE users SET refresh_token=$1 WHERE id=$2", [newRefreshToken, user_id], (error, results) => {
            if (error) {
                return res.status(500).json({msg:"There was an error, please contact support@shouryaeaga.com"})
            }
            res.cookie("access_token", newAccessToken, {sameSite: "lax", httpOnly: true, maxAge: 1000 * 60 * 15})
            res.cookie('refresh_token', newRefreshToken, {sameSite: "lax", httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7})
            return res.status(200).json({msg:"Success"})
        })
        
    })
}

const change_password = (req, res) => {
    const old_password = req.body.old_password
    const new_password = req.body.new_password

    if (!old_password || !new_password) {
        return res.status(400).json({msg: "Must send old and new password"})
    }

    // Check if old password matches
    const user_id = req.user.id
    db.query("SELECT * FROM users WHERE id=$1", [user_id], async (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({msg: "There was an error, please contact shourya.eaga.09@gmail.com"})
        }
        const password = results.rows[0].password
        try {
            const passwordMatch = await argon2.verify(password, old_password)
            if (passwordMatch) {
                const hashed_password = await argon2.hash(new_password)
                db.query("UPDATE users SET password=$1 WHERE id=$2", [hashed_password, user_id], (err, results) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).json({msg: "There was an error, please contact shourya.eaga.09@gmail.com"})
                    }
                    const newAccessToken = jwt.sign({username: req.user.username, type: "access"}, process.env.JWT_SECRET, {expiresIn: "15m"})
                    const newRefreshToken = jwt.sign({username: req.user.username, type: "refresh"}, process.env.JWT_SECRET, {expiresIn: "7d"})
                    // Invalidate old refresh token
                    db.query("UPDATE users SET refresh_token=$1 WHERE id=$2", [newRefreshToken,user_id], (error, results) => {
                        if (error) {
                            console.log(err)
                            return res.status(500).json({msg: "There was an error, please contact shourya.eaga.09@gmail.com"})
                        }
                        
                        res.cookie("access_token", newAccessToken, {sameSite: "lax", httpOnly: true, maxAge: 1000 * 60 * 15})
                        res.cookie('refresh_token', newRefreshToken, {sameSite: "lax", httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7})
                        return res.status(200).json({msg: "Changed password successfully"})
                    })

                    
                })
            } else {
                return res.status(400).json({msg: "Invalid old password"})
            }
        } catch (err) {
            console.log(err)
            return res.status(500).json({msg: "There was an error, please contact shourya.eaga.09@gmail.com"})
        }
    })
}

const change_email = (req, res) => {
    const new_email = req.body.email
    
    user_id = req.user.id

    db.query("UPDATE users SET email=$1 WHERE id=$2", [new_email, user_id], (err, results) => {
        if (err) {
            return res.status(500).json({msg: "There was an error, please contact shourya.eaga.09@gmail.com"})
        }
        const newAccessToken = jwt.sign({username: req.user.username, type: "access"}, process.env.JWT_SECRET, {expiresIn: "15m"})
        const newRefreshToken = jwt.sign({username: req.user.username, type: "refresh"}, process.env.JWT_SECRET, {expiresIn: "7d"})
        res.cookie("access_token", newAccessToken, {sameSite: "lax", httpOnly: true, maxAge: 1000 * 60 * 15})
        res.cookie('refresh_token', newRefreshToken, {sameSite: "lax", httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7})
        db.query("UPDATE users SET refresh_token=$1 WHERE username=$2", [newRefreshToken, req.user.username], (error, results) => {
            if (error) {
                return res.status(500).json({msg: "There was an error, please contact shourya.eaga.09@gmail.com"})
            }
            return res.status(200).json({msg: "Changed email successfully"})
        })
        
    })
}

module.exports = {signUp, login, refreshToken, logout, forgotPassword, resetPassword, change_username, change_password, change_email}
