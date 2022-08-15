import nodemailer from "nodemailer"

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, html: string) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
//   let testAccount = await nodemailer.createTestAccount();
//   console.log('test account:', testAccount)

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "yu3s4t25dcnfolhs@ethereal.email", // generated ethereal user
      pass: "tGzDgVqmgpZMWdnMbW", // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Your friendly neighborhood from Reddit Clone 👻"', // sender address
    to: to, // list of receivers
    subject: "Change password ✔", // Subject line
    html
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}