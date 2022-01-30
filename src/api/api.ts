import axios from "axios";
import scraper from "open-graph-scraper";
import { OperationsResponse } from "../types/operation";
import { ScraperResponse, ScraperResults } from "../types/scraper";

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

const getTokens = async (
  url: string,
  callback: (csrfToken: string, cookieSession: string) => void
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
      const typesafeRes = response as ScraperResponse;
      if (!error && typesafeRes) {
        const cookies = typesafeRes.headers["set-cookie"];
        const sessionId = getSessionId(cookies);
        callback(results.token, sessionId);
      } else {
        console.error("Something went wrong while fetching status");
      }
    }
  );
};

export const getOperations = (
  tokenUrl: string,
  apiUrl: string,
  callback: (operations: OperationsResponse) => void
) => {
  getTokens(tokenUrl, (csrfToken: string, cookieSession: string) => {
    getOperationsStatus(apiUrl, csrfToken, cookieSession, callback);
  });
};
