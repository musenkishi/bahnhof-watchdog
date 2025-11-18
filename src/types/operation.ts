export type Message = {
  message: string
  createdAt: string
}

export type Operation = {
  id: string
  lastUpdated: string
  title: string
  messages: Message[]
}

export type OperationsData = {
  open: Operation[]
  future: Operation[]
  closed: Operation[]
  all: Operation[]
}

export type ParsedTitle = {
  streets: string[]
  city?: string
  isp?: string
}

/**
 * Parse an operation title into streets, city and ISP.
 * Handles forms like:
 * - "Outage - Street1, Street2 - City (ISP)"
 * - "Street in City (ISP)"
 * - "City (ISP)"
 */
export function parseOperationTitle(title: string): ParsedTitle {
  if (!title) return { streets: [], city: undefined, isp: undefined }

  let working = title.trim()

  // extract ISP if present in trailing parentheses
  let isp: string | undefined
  const ispMatch = working.match(/\(([^)]+)\)\s*$/)
  if (ispMatch) {
    isp = ispMatch[1].trim()
    working = working.slice(0, ispMatch.index!).trim()
  }

  // split by dashes which often separate streets and city
  const dashParts = working.split(/\s*-\s*/)
  let city: string | undefined
  let streetsPart = ''

  if (dashParts.length >= 2) {
    // last dash-separated segment is usually the city
    city = dashParts[dashParts.length - 1].trim()
    streetsPart = dashParts.slice(0, dashParts.length - 1).join(' - ').trim()
  } else {
    // try "Street i City" pattern
    const inMatch = working.match(/(.+?)\s+i\s+(.+)/i)
    if (inMatch) {
      streetsPart = inMatch[1].trim()
      city = inMatch[2].trim()
    } else {
      // single segment — decide if it's streets or a city
      if (working.includes(',') || working.match(/\b(and|straße|strasse|street)\b/i)) {
        streetsPart = working
      } else {
        city = working || undefined
      }
    }
  }

  // remove common leading tokens like "Outage"
  streetsPart = streetsPart.replace(/^(Planerat Servicearbete)\b[:\s-]*/i, '').trim()

  // split streets by comma, slash, semicolon or "and"
  const streets = streetsPart
    ? streetsPart
        .split(/\s*(?:,|\/|;|\band\b)\s*/i)
        .map(s => s.trim())
        .filter(Boolean)
    : []

  return { streets, city: city || undefined, isp: isp || undefined }
}