import express from "express";
import { getOperations } from "./api/api";

const app = express();
const port = 3000;
const bahnUrlHtml = "https://bahnhof.se/kundservice/driftinfo";
const bahnUrlApi = "https://bahnhof.se/ajax/kundservice/driftinfo";

app.get("/", (req, res) => {
  getOperations(bahnUrlHtml, bahnUrlApi, (operations) => {
    res.send(operations);
  });
});

app.listen(port, () => {
  return console.log("Express is listening at http://localhost:" + port);
});
