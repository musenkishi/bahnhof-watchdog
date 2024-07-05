import { addToFile, createFile, fileExists } from "../api/file"
import { LogSubscription } from "../types/log"
import { Subscription } from "../types/subscription"

const LOG_PRICE_FILENAME = "price_history.csv"
const CSV_SEPARATOR = ";"

export const logPrice = async (
  currentSubscription: Subscription,
  listedSubscription: Subscription
) => {
  const log: LogSubscription = {
    speed: currentSubscription.speed,
    address: process.env.ADDRESS,
    currentPrice: currentSubscription.price,
    listedPrice: listedSubscription.price,
    date: new Date(),
  }

  const logData = [
    log.speed,
    log.address,
    log.currentPrice,
    log.listedPrice,
    log.date.toISOString(),
  ]

  const fileExist = await fileExists(LOG_PRICE_FILENAME)

  if (!fileExist) {
    const header = ["Speed", "Address", "Current Price", "Listed Price", "Date"]
    await createFile(LOG_PRICE_FILENAME, header.join(CSV_SEPARATOR) + "\n")
  }

  await addToFile(LOG_PRICE_FILENAME, logData.join(CSV_SEPARATOR) + "\n")
}
