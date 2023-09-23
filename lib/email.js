import nodemailer from "nodemailer";

const smtpOptions = {
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: parseInt(process.env.SMTP_PORT || "2525"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "user",
    pass: process.env.SMTP_PASSWORD || "password",
  },
};

export const sendEmail = async (data) => {
  const transporter = nodemailer.createTransport({
    ...smtpOptions,
  });

  return await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    ...data,
  });
};
