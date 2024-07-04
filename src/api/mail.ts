import nodemailer from "nodemailer"
import { MailOptions } from "nodemailer/lib/json-transport"

export const sendMail = (report: string) => {
  const sender = process.env.MAIL_SENDER
  const senderPassword = process.env.MAIL_SENDER_PASS
  const receiver = process.env.MAIL_RECEIVER
  if (!sender || !senderPassword || !receiver) {
    console.log(
      "Environment variables MAIL_SENDER, MAIL_SENDER_PASS, and MAIL_RECEIVER missing. Skipping sending mail..."
    )
    return
  }
  console.log("Sending mail")

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: sender,
      pass: senderPassword,
    },
  })

  const mailOptions: MailOptions = {
    from: sender,
    to: receiver,
    subject: "New report from Bahnhof Watchdog",
    text: report,
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error(error)
    if (info) console.log(info)
  })
}
