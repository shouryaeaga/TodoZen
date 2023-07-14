const jwt = require("jsonwebtoken")
const db = require("../../database/db")


const regularUserPermission = async (req, res, next) => {
    const access_token = req.cookies.access_token
    if (!access_token) {
        return res.status(401).json({msg : "Unauthorized"})
    }
    try {
        const {username, type} = jwt.verify(access_token, process.env.JWT_SECRET)

        // Check if the user is in database
        const user = await db.query("SELECT * FROM users WHERE username = $1", [username.toLowerCase()])
        if (user.rowCount === 0) {
            return res.status(401).json({msg: "Unauthorized"})
        }

        if (type === 'access') {
            req.user = user.rows[0]
            next()
        } else {
            return res.status(401).json({msg: "Unauthorized"})
        }
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({msg: "Unauthorized"})
        }
        console.log(error)
        return res.status(500).json({msg: error})
    }
}

const adminUserPermission = async (req, res, next) => {
    const access_token = req.cookies.access_token
    if (!access_token) {
        return res.status(401).json({msg : "Unauthorized"})
    }
    try {
        const {username, type} = jwt.verify(access_token, process.env.JWT_SECRET)

        // Check if the user is in database
        const user = await db.query("SELECT * FROM users WHERE username = $1", [username])
        if (user.rowCount === 0) {
            return res.status(401).json({msg: "Unauthorized"})
        }
        const isAdmin = user.rows[0].admin

        if (type === 'access' && isAdmin) {
            res.locals.username = username
            next()
        } else {
            return res.status(401).json({msg: "Unauthorized"})
        }
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({msg: "Unauthorized"})
        }
        return res.status(500).json({msg: error})
    }
}

module.exports = {regularUserPermission, adminUserPermission}