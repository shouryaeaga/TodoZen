const nodemailer = require('nodemailer');

const sendEmail = async (from, to, subject, html, text) => {
    let mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: html,
        text: text
    }
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            user : "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })
        transporter.sendMail(mailOptions, (error, info) => {
            if (err) {
                console.log("Email not sent:", error)
            } else {
                console.log("Email sent:", info)
            }

        })
    } catch (error) {
        console.log("Email not sent:", error)
        return error
    }
}

module.exports = sendEmail