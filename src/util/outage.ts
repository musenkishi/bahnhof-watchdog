import { Operation } from "../types/operation"

export const filterByKeywords = (operations: Operation[]): Operation[] => {
  const keywordsEnv = process.env.OUTAGE_KEYWORDS || ""
  const outageKeywords = keywordsEnv
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0)

  if (outageKeywords.length === 0) {
    // no filtering
    return operations
  }

  const filteredOperations = operations.filter((operation) => {
    const title = operation.title.toLowerCase()
    const messages = operation.messages
      .map((m) => m.message.toLowerCase())
      .join(" ")

    return outageKeywords.some(
      (keyword) => title.includes(keyword) || messages.includes(keyword)
    )
  })
  return filteredOperations
}
