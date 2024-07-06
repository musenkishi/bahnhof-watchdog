import { writeFileSync } from "node:fs"
import {
  access,
  appendFile,
  mkdir,
  readFile,
  writeFile,
  constants,
} from "node:fs/promises"
import { join } from "path"

const DATA_PATH = "data"
const FILE_ENCODING = "utf-8"

const getFilePath = (filename: string): string => join(DATA_PATH, filename)

export const loadFile = async (filename: string) => {
  try {
    await mkdir(DATA_PATH, { recursive: true })
  } catch (err) {
    console.error(err)
  }

  const filePath = getFilePath(filename)

  await fileExists(filename).then((exists) => {
    if (!exists) {
      try {
        writeFileSync(filePath, "", FILE_ENCODING)
        console.log("File created", filePath)
      } catch (err) {
        console.error("Error creating file", err.message)
      }
    }
  })

  try {
    const data = await readFile(filePath, FILE_ENCODING)
    return data
  } catch (err) {
    console.error(`Error reading file: ${err.message}`)
    throw err
  }
}

export const syncFile = (filename: string, data: unknown) => {
  console.log("Syncing file", filename, "to", getFilePath(filename))
  writeFileSync(join(DATA_PATH, filename), JSON.stringify(data), FILE_ENCODING)
}

export const createFile = async (filename: string, data: string) => {
  await writeFile(getFilePath(filename), data, "utf-8")
}

export const addToFile = async (filename: string, data: string) => {
  await appendFile(getFilePath(filename), data, FILE_ENCODING)
}

export const fileExists = async (filename: string): Promise<boolean> => {
  try {
    await access(getFilePath(filename), constants.R_OK | constants.W_OK)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
