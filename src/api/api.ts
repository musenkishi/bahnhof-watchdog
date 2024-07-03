import axios from "axios"
import scraper from "open-graph-scraper"
import { Network, NetworkResponse } from "../types/network"
import { OperationsResponse } from "../types/operation"
import { Network as MinimalNetwork, ProductsResponse } from "../types/product"
import { ScraperResponse, ScraperResults } from "../types/scraper"

const tokenUrl = "https://bahnhof.se/kundservice/driftinfo"
const apiOperationsUrl = "https://bahnhof.se/ajax/kundservice/driftinfo"
const apiNetworksUrl = "https://bahnhof.se/ajax/search/networks"
const apiProductsUrl = "https://bahnhof.se/ajax/bredband/products"

const getSessionId = (cookies: string[]) => {
  const splitCookies = cookies.map((cookieString) => {
    const pairs = cookieString.split(";")
    const splittedPairs = pairs.map((cookie) => cookie.split("="))
    const obj = Object.fromEntries(splittedPairs)
    return obj
  })
  const sessionCookie = splitCookies.find((cookies) => cookies.PHPSESSID)
  return sessionCookie.PHPSESSID || false
}

const getTokens = async (
  url: string,
  callback: (csrfToken: string, cookieSession: string) => void
) => {
  const tokenName = "csrf-token"
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
      const typesafeRes = response as ScraperResponse
      if (!error && typesafeRes) {
        const cookies = typesafeRes.headers["set-cookie"]
        const sessionId = getSessionId(cookies)
        callback(results.token, sessionId)
      } else {
        console.error("Something went wrong while fetching status")
      }
    }
  )
}

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
    })
    callback(response.data)
  } catch (err) {
    console.error(err.toJSON() || err)
  }
}

const getAvailableNetworks = async (
  url: string,
  address: string,
  token: string,
  sessionId: string,
  callback: (response: NetworkResponse) => void
) => {
  try {
    const response = await axios.post(
      url,
      {
        address: address,
      },
      {
        headers: {
          Cookie: "PHPSESSID=" + sessionId,
          "X-CSRF-TOKEN": token,
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    )
    callback(response.data)
  } catch (err) {
    console.error(err.toJSON() || err)
  }
}

const getAvailableProducts = async (
  url: string,
  networks: MinimalNetwork[],
  token: string,
  sessionId: string,
  callback: (response: ProductsResponse) => void
) => {
  try {
    const response = await axios.post(
      url,
      {
        networks: networks,
      },
      {
        headers: {
          Cookie: "PHPSESSID=" + sessionId,
          "X-CSRF-TOKEN": token,
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    )
    callback(response.data)
  } catch (err) {
    console.error(err.toJSON() || err)
  }
}

export const getProducts = (
  address: string,
  callback: (response: ProductsResponse) => void
) => {
  getTokens(tokenUrl, (csrfToken: string, cookieSession: string) => {
    getAvailableNetworks(
      apiNetworksUrl,
      address,
      csrfToken,
      cookieSession,
      (response: NetworkResponse) => {
        const minimalNetworks: MinimalNetwork[] = response.data.networks.map(
          (network) => {
            return {
              city: network.city,
              network: network.value,
            }
          }
        )
        getAvailableProducts(
          apiProductsUrl,
          minimalNetworks,
          csrfToken,
          cookieSession,
          (response) => {
            callback(response)
          }
        )
      }
    )
  })
}

export const getOperations = (
  postalCode: string,
  callback: (operations: OperationsResponse) => void
) => {
  const apiUrl = apiOperationsUrl + "/" + postalCode
  console.log("getOperations: ", apiUrl)
  getTokens(tokenUrl, (csrfToken: string, cookieSession: string) => {
    getOperationsStatus(apiUrl, csrfToken, cookieSession, callback)
  })
}
