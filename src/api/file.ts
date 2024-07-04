import { constants, writeFileSync } from "fs"
import { access, mkdir, readFile } from "fs/promises"
import { join } from "path"

const DATA_PATH = "data"

export const loadFile = async (filename: string) => {
  try {
    await mkdir(DATA_PATH, { recursive: true })
  } catch (err) {
    if (err) console.error(err)
  }

  const filePath = join(DATA_PATH, filename)

  try {
    await access(filePath, constants.F_OK)
  } catch (err) {
    try {
      writeFileSync(filePath, "", "utf-8")
      console.log("File created", filePath)
    } catch (err) {
      console.error("Error creating file", err.message)
    }
  }

  try {
    const data = await readFile(filePath, "utf-8")
    return data
  } catch (err) {
    console.error(`Error reading file: ${err.message}`)
    throw err
  }
}

export const syncFile = (filename: string, data: unknown) => {
  const filePath = join(DATA_PATH, filename)
  console.log("syncing file", filename, " to ", filePath, ", data:", data)
  writeFileSync(join(DATA_PATH, filename), JSON.stringify(data), "utf-8")
}
