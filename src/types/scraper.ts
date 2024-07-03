import { ErrorResult, SuccessResult } from "open-graph-scraper"

export type ScraperResults = (SuccessResult | ErrorResult) & {
  token: string
}

export type ScraperResponse = {
  headers: ResponseHeaders
}

export type ResponseHeaders = {
  "set-cookie": string[]
}
