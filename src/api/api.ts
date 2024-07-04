import axios from "axios"
import TurndownService from "turndown"
import { NetworkResponse } from "../types/network"
import { OperationsResponse } from "../types/operation"
import { Network as MinimalNetwork, ProductsResponse } from "../types/product"

const api = axios.create({
  timeout: 30000,
})

const baseUrl = new URL("https://bahnhof.se")
const apiBaseUrl = new URL("ajax/", baseUrl)
const tokenUrl = new URL("kundservice/driftinfo", baseUrl).toString()
const apiOperationsUrl = new URL("kundservice/driftinfo", apiBaseUrl).toString()
const apiNetworksUrl = new URL("search/networks", apiBaseUrl).toString()
const apiProductsUrl = new URL("bredband/products", apiBaseUrl).toString()

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

const findToken = (data: any) => {
  const tokenName = "csrf-token"
  const regex = new RegExp(`<meta[^>]*name=["']?${tokenName}["']?[^>]*>`, "i")
  const match = data.match(regex)

  const tokenTag = match && match[0]
  if (!tokenTag) return

  const contentRegex = /content=["']([^"']*)["']/i
  const contentMatch = tokenTag.match(contentRegex)

  const token = contentMatch && contentMatch[1]
  if (!token) return
  return token
}

const getTokens = async (
  url: string,
  callback: (csrfToken: string, cookieSession: string) => void
) => {
  api.get(url).then((result) => {
    const token = findToken(result.data)
    const cookies = result.headers["set-cookie"]
    const sessionId = getSessionId(cookies)
    if (!Array.isArray(token)) {
      callback(token, sessionId)
    } else {
      throw new Error("Token is not a string")
    }
  })
}

const getOperationsStatus = async (
  url: string,
  token: string,
  sessionId: string,
  callback: (operations: OperationsResponse) => void
) => {
  try {
    const response = await api.get(url, {
      headers: {
        Cookie: "PHPSESSID=" + sessionId,
        "X-CSRF-TOKEN": token,
        "X-Requested-With": "XMLHttpRequest",
      },
    })
    callback(response.data)
  } catch (err) {
    console.error(err)
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
    const response = await api.post(
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
    console.error(err)
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
    const response = await api.post(
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
    console.error(err)
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
  getTokens(tokenUrl, (csrfToken: string, cookieSession: string) => {
    getOperationsStatus(apiUrl, csrfToken, cookieSession, callback)
  })
}

export const sendWebhook = async (message: string) => {
  const turndownService = new TurndownService({ headingStyle: "atx" })
  const webhookUrl = process.env.WEBHOOK_URL
  console.log(
    webhookUrl
      ? "Sending webhook"
      : "Environment variable WEBHOOK_URL missing. Skipping sending webhook..."
  )
  try {
    await api.post(
      webhookUrl,
      {
        username: "Bahnhof Watchdog",
        content: turndownService.turndown(message),
      },
      {
        headers: {
          "Content-type": "application/json",
        },
      }
    )
  } catch (err) {
    console.error(err)
  }
}
