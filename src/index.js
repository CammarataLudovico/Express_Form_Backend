const express = require("express");

const server = express();
const port = 3000;

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();


const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASS
    }
}); 

const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: '',
    subject: 'Test Email',
    text: 'Hello, this is a test email sent using Nodemailer and Gmail.'
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log('Error sending email: ', error);
    }
    console.log('Email sent: ', info.response);
});

server.listen(port, () => {
    console.log("Server in Ascolto!")
})