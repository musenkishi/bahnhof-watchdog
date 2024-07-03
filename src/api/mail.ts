import nodemailer from "nodemailer"
import { MailOptions } from "nodemailer/lib/json-transport"
import SMTPTransport from "nodemailer/lib/smtp-transport"

type Auth = {
  user: string
  pass: string
}

export const sendMail = (
  auth: Auth,
  to: string,
  callback: (error: Error, info: SMTPTransport.SentMessageInfo) => void
) => {
  const mail = to
  if (mail) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: auth,
    })

    const mailOptions: MailOptions = {
      from: auth.user,
      to: mail,
      subject: "nodemailer test",
      text: "Hello world!",
    }

    transporter.sendMail(mailOptions, callback)
  }
}
