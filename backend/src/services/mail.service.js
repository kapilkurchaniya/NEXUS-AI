import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_USER_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

await transporter
  .verify()
  .then(() => {
    console.log("Email service is ready");
  })
  .catch((error) => {
    console.error("Error setting up email service:", error);
  });

export async function sendEmail({ to, subject, html, text }) {

  try {

    const mailOptions = {
      from: `"Perplexity" <${process.env.GOOGLE_USER_EMAIL}>`,
      to,
      subject,
      html,
      text,
    };

    const details = await transporter.sendMail(mailOptions);

    console.log("Email sent:", details.response);

    return details;

  } catch (error) {

    console.error("Error sending email:", error);

  }
}