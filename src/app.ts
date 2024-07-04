import dotenv from "dotenv"
import { getProducts, getOperations, sendWebhook } from "./api/api"
import { sendMail } from "./api/mail"
import {
  generateOutageMessage,
  generateSubscriptionMessage,
} from "./util/message"
import { findProductAndConvertWithReduce as getListedSubscription } from "./util/product"
import cron from "node-cron"
import { handleBuffer } from "./util/buffer"
import cronstrue from "cronstrue"

//Load variables from .env file
dotenv.config()
const CRON_SCHEDULE = process.env.CRON_SCHEDULE

const currentSubscription = {
  name: process.env.CURRENT_PRODUCT,
  price: Number.parseInt(process.env.CURRENT_PRICE),
}

const doPatrol = async (callback: (report: string) => void) => {
  console.log("Starting patrol...")

  const zonePromises = []

  if (!process.env.POSTAL_CODE) {
    console.info(
      "Environment variable POSTAL_CODE missing. Skipping outages check..."
    )
  } else {
    zonePromises.push(
      new Promise<void>((resolve, reject) => {
        getOperations(process.env.POSTAL_CODE, (operations) => {
          const currentOutages = operations.data.open
          const plannedOutages = operations.data.future
          if (currentOutages.length > 0 || plannedOutages.length > 0) {
            const message = generateOutageMessage(
              currentOutages,
              plannedOutages
            )
            callback(message)
          }
          resolve()
        })
      })
    )
  }

  if (!process.env.ADDRESS) {
    console.info(
      "Environment variable ADDRESS missing. Skipping subscription price check..."
    )
  } else {
    zonePromises.push(
      new Promise<void>((resolve, reject) => {
        getProducts(process.env.ADDRESS, (result) => {
          const listedSubscription = getListedSubscription(
            result.data.products,
            currentSubscription.name
          )

          if (!listedSubscription) {
            callback(
              "No subscriptions matches your current subscription or none are available on your address"
            )
          }

          if (listedSubscription.price < currentSubscription.price) {
            const message = generateSubscriptionMessage(
              currentSubscription,
              listedSubscription
            )
            callback(message)
          }
          resolve()
        })
      })
    )
  }
  await Promise.all(zonePromises)
  console.log("Patrol finished.")
}

const sendReport = (report: string, skipBuffer?: boolean) => {
  if (!report) return

  const sendMessage = (message: string) => {
    sendWebhook(message)
    sendMail(message)
  }

  if (skipBuffer) {
    sendMessage(report)
  } else {
    handleBuffer(report, () => {
      sendMessage(report)
    })
  }
}

if (CRON_SCHEDULE) {
  cron.schedule(CRON_SCHEDULE, () => {
    doPatrol((report) => {
      sendReport(report)
    })
  })
  const startMessage =
    "Watchdog will start patrolling with an interval of " +
    cronstrue.toString(CRON_SCHEDULE).toLowerCase()
  console.log(startMessage)
  sendReport(startMessage, true)
} else {
  // no cron schedule set, run patrol once if possible
  doPatrol((report) => {
    sendReport(report)
  })
}
