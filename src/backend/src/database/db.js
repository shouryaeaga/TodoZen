const Pool = require("pg").Pool

let pool
if (process.env.DEBUG == "true") {
    pool = new Pool({
        host: "localhost",
        user: process.env.DATABASE_USERNAME,
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        port: process.env.DATABASE_PORT,
    
    })
} else {
    pool = new Pool({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USERNAME,
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        port: process.env.DATABASE_PORT,
    
    })
}


module.exports = pool