import nodemailer from "nodemailer";
import env from "../config";

// async..await is not allowed in global scope, must use a wrapper
export default async function sendEmail(emailInfo) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
//   let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false 587 for other ports
    auth: {
      user: env.MAIL_USER, // generated ethereal user
      pass: env.MAIL_PASS, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let sendingEmail = await transporter.sendMail({
    from: env.MAIL_USER, // sender address
    to: emailInfo.email, // list of receivers
    subject: emailInfo.subject, // Subject line
    text: emailInfo.text||'', // plain text body
    html: emailInfo.html, // html body
  });

  console.log("Message sent: %s", sendingEmail.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(sendingEmail));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

