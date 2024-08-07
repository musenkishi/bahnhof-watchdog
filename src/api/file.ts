import { access, appendFile, constants, mkdir } from "node:fs/promises"
import { join } from "path"

const DATA_PATH = "data"
const FILE_ENCODING = "utf-8"

const getFilePath = (filename: string): string => join(DATA_PATH, filename)

try {
  //ensure data path exists
  mkdir(DATA_PATH, { recursive: true })
} catch (err) {
  console.error(err)
}

export const loadFile = async (filename: string) => {
  const filePath = getFilePath(filename)

  await fileExists(filename).then((exists) => {
    if (!exists) {
      try {
        writeFile(filename, "")
      } catch (err) {
        console.error("Error creating file", err.message)
      }
    }
  })

  try {
    const data = await Bun.file(filePath).text()
    return data
  } catch (err) {
    console.error(`Error reading file: ${err.message}`)
    throw err
  }
}

export const writeFile = async (filename: string, data: string) => {
  console.log("Creating file", filename, "...")
  await Bun.write(getFilePath(filename), data)
}

export const addToFile = async (filename: string, data: string) => {
  console.log("Adding new data to file", filename, ":", data)
  await appendFile(getFilePath(filename), data, FILE_ENCODING)
}

export const fileExists = async (filename: string): Promise<boolean> => {
  try {
    await access(getFilePath(filename), constants.R_OK | constants.W_OK)
    return true
  } catch (error) {
    console.error("File", filename, "doesn't exist")
    return false
  }
}
