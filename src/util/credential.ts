export const getSessionId = (cookies: string[]) => {
  const splitCookies = cookies.map((cookieString) => {
    const pairs = cookieString.split(";")
    const splittedPairs = pairs.map((cookie) => cookie.split("="))
    const obj = Object.fromEntries(splittedPairs)
    return obj
  })
  const sessionCookie = splitCookies.find((cookies) => cookies.PHPSESSID)
  return sessionCookie.PHPSESSID || false
}

export const findToken = (data: any) => {
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
