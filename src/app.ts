import dotenv from "dotenv";
import express from "express";
import { getOperations } from "./api/api";
import { sendMail } from "./api/mail";
import cron from "node-cron";

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
  sendMail(
    {
      user: process.env.SERVER_MAIL,
      pass: process.env.SERVER_MAIL_PASS,
    },
    req.query.mail as string,
    (error, info) => {
      if (error) {
        res.send(error);
      } else {
        res.send("Mail sent! " + info.response);
      }
    }
  );
});

app.listen(port, () => {
  return console.log("Express is listening at http://localhost:" + port);
});

//Fires every minute
cron.schedule("* * * * *", () => {
  console.log("Executing scheduled job");
  getOperations(bahnUrlHtml, bahnUrlApi, (operations) => {
    // res.send(operations);
    const result = operations.data.all.filter((operation) =>
      operation.title.includes("Östersund" || "Lärbro")
    );

    console.log("Found", result || "nothing");
  });
});
