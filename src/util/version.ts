import { loadFile, syncFile } from "../api/file"

const FILENAME_VERSION = ".version"
const VERSION = "1.0.0"

export const checkVersion = async () => {
    const existingVerFile = await loadFile(FILENAME_VERSION)
    if (existingVerFile != VERSION) {
        // Handle any breaking changes in future upgrades here
    }
    syncFile(FILENAME_VERSION, VERSION)
}