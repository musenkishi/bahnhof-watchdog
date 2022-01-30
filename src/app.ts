import express from "express";
import { getOperations } from "./api/api";
import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import dotenv from "dotenv";

//Load variables from .env file
dotenv.config();
const app = express();
const port = 3000;
const bahnUrlHtml = "https://bahnhof.se/kundservice/driftinfo";
const bahnUrlApi = "https://bahnhof.se/ajax/kundservice/driftinfo";

app.get("/", (req, res) => {
  getOperations(bahnUrlHtml, bahnUrlApi, (operations) => {
    res.send(operations);
  });
});

app.get("/send", (req, res) => {
  const mail = req.query.mail;
  if(mail) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SERVER_MAIL,
        pass: process.env.SERVER_MAIL_PASS,
      },
    });
  
    const mailOptions: MailOptions = {
      from: process.env.SERVER_MAIL,
      to: mail as string,
      subject: "nodemailer test",
      text: "Hello world!",
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.send(error);
      } else {
        res.send("Mail sent! " + info.response);
      }
    });
  }
  // res.send("Hello world");
});

app.listen(port, () => {
  return console.log("Express is listening at http://localhost:" + port);
});
