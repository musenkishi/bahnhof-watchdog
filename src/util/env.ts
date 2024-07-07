export const getMissingSubscriptionVariables = (): string[] =>
  ["ADDRESS", "CURRENT_SPEED", "CURRENT_PRICE"].filter(
    (envVar) => !process.env[envVar]
  )

export const getMissingOutageVariables = (): string[] =>
  ["POSTAL_CODE"].filter((envVar) => !process.env[envVar])

export const getMissingMailVariables = (): string[] =>
  ["MAIL_SENDER", "MAIL_SENDER_PASS", "MAIL_RECEIVER"].filter(
    (envVar) => !process.env[envVar]
  )
