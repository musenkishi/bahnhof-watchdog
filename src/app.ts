import axios from "axios";
import express from "express";
import scraper from "open-graph-scraper";
import { OperationsResponse } from "./types/operation";
import { ScraperResponse, ScraperResults } from "./types/scraper";

const app = express();
const port = 3000;
const bahnUrlHtml = "https://bahnhof.se/kundservice/driftinfo";
const bahnUrlApi = "https://bahnhof.se/ajax/kundservice/driftinfo";

app.get("/", (req, res) => {
  getToken(bahnUrlHtml, (operations) => {
    res.send(operations);
  });
});

app.listen(port, () => {
  return console.log("Express is listening at http://localhost:" + port);
});

const getSessionId = (cookies: string[]) => {
  const splitCookies = cookies.map((cookieString) => {
    const pairs = cookieString.split(";");
    const splittedPairs = pairs.map((cookie) => cookie.split("="));
    const obj = Object.fromEntries(splittedPairs);
    return obj;
  });
  const sessionCookie = splitCookies.find((cookies) => cookies.PHPSESSID);
  return sessionCookie.PHPSESSID || false;
};

const getOperationsStatus = async (
  url: string,
  token: string,
  sessionId: string,
  callback: (operations: OperationsResponse) => void
) => {
  try {
    const response = await axios.get(url, {
      headers: {
        Cookie: "PHPSESSID=" + sessionId,
        "X-CSRF-TOKEN": token,
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    callback(response.data);
  } catch (err) {
    console.error(err.toJSON() || err);
  }
};

const getToken = async (
  url: string,
  callback: (operations: OperationsResponse) => void
) => {
  const tokenName = "csrf-token";
  scraper(
    {
      url,
      customMetaTags: [
        {
          multiple: false,
          property: tokenName,
          fieldName: "token",
        },
      ],
    },
    (error: boolean, results: ScraperResults, response: unknown) => {
      if (!error && response) {
        const typesafeRes = response as ScraperResponse;
        if (typesafeRes) {
          const cookies = typesafeRes.headers["set-cookie"];
          const sessionId = getSessionId(cookies);
          getOperationsStatus(bahnUrlApi, results.token, sessionId, callback);
        }
      } else {
        console.error("Something went wrong while fetching status");
      }
    }
  );
};
