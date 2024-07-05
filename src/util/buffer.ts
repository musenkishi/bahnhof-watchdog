import { loadFile, syncFile } from "../api/file"

const FILENAME_BUFFER = "watchdog_buffer.json"
const MAX_BUFFER_SIZE = 20 // No need to store more than this

export const syncBuffer = (buffer: Map<string, unknown>) => {
  syncFile(FILENAME_BUFFER, [...buffer])
}

export const loadBuffer = async () => {
  try {
    const data = await loadFile(FILENAME_BUFFER)
    const parsedData = data && JSON.parse(data)
    if (Array.isArray(parsedData)) {
      return new Map(parsedData)
    } else {
      console.error(
        `Unexpected data format: expected an array but got ${typeof parsedData}. Creating new buffer...`
      )
      return new Map()
    }
  } catch (err) {
    console.error("Error loading buffer:", err)
    throw err
  }
}

export const handleBuffer = async (report, callback) => {
  const file = await loadBuffer()
  const reportBuffer = file instanceof Map ? file : new Map()

  if (reportBuffer.has(report)) {
    console.log("Report already sent. Ignoring...")
    return
  }

  console.log("New report!")
  reportBuffer.set(report, Date.now()) // Only interested in key insertion

  if (reportBuffer.size > MAX_BUFFER_SIZE) {
    const oldestKey = reportBuffer.keys().next().value
    reportBuffer.delete(oldestKey)
  }

  syncBuffer(reportBuffer)

  callback()
}
