import nodemailer from "nodemailer"
import { MailOptions } from "nodemailer/lib/json-transport"
import { getMissingMailVariables } from "../util/env"

export const sendMail = (report: string) => {
  const missingEnvironmentVariables = getMissingMailVariables()
  if (missingEnvironmentVariables.length > 0) {
    console.info(
      "Skipping mail. Following environment variables are missing:",
      missingEnvironmentVariables.join(", ")
    )
    return
  }

  const sender = process.env.MAIL_SENDER
  const senderPassword = process.env.MAIL_SENDER_PASS
  const receiver = process.env.MAIL_RECEIVER

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
