const express = require('express')
const cookieParser = require("cookie-parser")
const cors = require("cors")
const morgan = require("morgan")
require("dotenv").config()

// Routers
const authRouter = require("./routes/authRouter")
const todoRouter = require("./routes/todoRouter")

const app = express()

// Middlewares
const {
    adminUserPermission, 
    regularUserPermission
} = require("./middleware/authMiddleware/authorizationPermission")

app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))

if (process.env.DEBUG == "true") {
    app.use(cors({
        origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
        credentials: true
    }
    ))
} else {
    app.use(cors({
        origin: ["http://127.0.0.1", "http://localhost", "http://localhost:3000", "http://127.0.0.1:3000", "http://141.147.78.125/", "https://141.147.78.125/"],
        credentials: true
    }
    ))
}


app.use("/auth", authRouter)
app.use("/todo", todoRouter)

if (process.env.DEBUG == "true") {
    app.listen(5000, () => {
        console.log("listening on port 5000")
    })
} else {
    app.listen(8000, () => {
        console.log("listening on port 8000")
    })
}

