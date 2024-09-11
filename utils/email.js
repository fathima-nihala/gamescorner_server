const nodemailer = require('nodemailer');
const path = require ('path');
const fs = require('fs')

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Template</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background-color: #F7F8F9;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #000000;
                }
                .container {
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 10px;
                    background-color: #ffffff;
                }
                .header img {
                    width: 100%;
                    max-width: 250px;
                    height: auto;
                    display: block;
                    margin: 0 auto;
                }
                .content {
                    padding: 10px;
                }
                .content p {
                    margin: 0 0 10px;
                }
                .divider {
                    border-top: 1px solid #BBBBBB;
                    margin: 10px 0;
                }
                .social-icons {
                    text-align: center;
                    padding: 10px;
                }
                .social-icons a {
                    margin: 0 5px;
                    display: inline-block;
                }
                .social-icons img {
                    width: 32px;
                    height: 32px;
                }
                @media (max-width: 520px) {
                    .container {
                        padding: 0;
                    }
                    .content {
                        padding: 10px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-right: 0px;padding-left: 0px;" align="left">
                
                <img align="left" border="0" src="cid:logoImage" alt="" title="" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 26%;max-width: 119.6px;" width="119.6"/>
                
              </td>
            </tr>
          </table>
            <div class="divider"></div>
            <div class="content">
                <p><strong>Hello, ${options.email}!</strong></p>
                <p>Dear ${options.email}, welcome to Lenora</p>
                <p>We have received your reset password request</p>
                 <div> 
                 <div>Your OTP for password reset is:<strong>${options.message}</strong></div>
               </div>
            </div>
             <div class="social-icons" style="text-align: center;display:flex;justify-content:flex-start;gap:5px; justify-items:flex-start">
        
        </div>
        </div>
    </body>
    </html>`,
        attachments: [
            {
                filename: 'lenora 2-01.png',
                path: path.join(__dirname, '../assets/lenora 2-01.png'),
                cid: 'logoImage'
            }
        ]
    };

    try {
        await transporter.sendMail(message);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;