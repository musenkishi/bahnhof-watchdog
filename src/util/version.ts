import { semver } from "bun"
import { loadFile, writeFile } from "../api/file"

const FILENAME_VERSION = ".version"
const VERSION = "1.3.0"

export type VersionReport = {
  message: string
  important?: boolean
}

export const checkVersion = async (
  onReports?: (reports: VersionReport[]) => void
) => {
  const existingVerFile = await loadFile(FILENAME_VERSION)
  const reports: VersionReport[] = []

  if (existingVerFile && existingVerFile != VERSION) {
    if (
      semver.satisfies(existingVerFile, "<1.2.0") &&
      semver.satisfies(VERSION, "^1.2.x")
    ) {
      reports.push({
        message:
          "🎉 New feature in 1.2.0: Reports will now be printed in console. Opt out by using the environment variable: SUPPRESS_CONSOLE_REPORTS=true",
      })
    }
    if (
      semver.satisfies(existingVerFile, "<1.3.0") &&
      semver.satisfies(VERSION, "^1.3.x")
    ) {
      reports.push({
        message:
          `🔑 New feature in 1.3.0: 
          You can now filter outage reports by keywords using the OUTAGE_KEYWORDS environment variable (comma-separated).
          Example: OUTAGE_KEYWORDS=Uppsala, Kungsängen, Tullgarnsgatan`,
      })
    }

    // Handle any breaking changes in future upgrades here
    semver.satisfies(existingVerFile, "1.x.x")
  }
  writeFile(FILENAME_VERSION, VERSION)

  if (reports.length > 0 && onReports) {
    onReports(reports)
  }
}
