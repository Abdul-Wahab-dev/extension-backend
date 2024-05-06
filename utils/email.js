const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  // 1) create a transporter
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",

    // secure: false,

    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) define the email options
  const mailOptions = {
    from: "futjan.sup@outlook.com",
    to: option.email,
    subject: option.subject,
    text: option.message,
  };
  // 3) actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
