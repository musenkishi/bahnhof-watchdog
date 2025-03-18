import cronstrue from "cronstrue"
import { CronJob } from "cron"
import { getOperations, getProducts, sendWebhook } from "./api/api"
import { sendMail } from "./api/mail"
import { Subscription } from "./types/subscription"
import { handleBuffer } from "./util/buffer"
import {
  getMissingOutageVariables,
  getMissingSubscriptionVariables,
} from "./util/env"
import { logPrice } from "./util/log"
import {
  generateOutageMessage,
  generateSubscriptionMessage,
} from "./util/message"
import { findProductAndConvertWithReduce as getListedSubscription } from "./util/product"
import { checkVersion } from "./util/version"
import { printMessage } from "./api/console"

checkVersion((reports) => {
  reports.forEach((report) => {
    sendReport(report.message, report.important)
  })
})

const currentSubscription: Subscription = {
  speed: process.env.CURRENT_SPEED,
  price: Number.parseInt(process.env.CURRENT_PRICE),
}

const doPatrol = async (callback: (report: string) => void) => {
  console.log("Starting patrol...")

  const zonePromises = []

  const missingOutageParams = getMissingOutageVariables()

  if (missingOutageParams.length > 0) {
    console.info(
      "Skipping outages check. Following environment variables are missing:",
      missingOutageParams.join(", ")
    )
  } else {
    zonePromises.push(
      new Promise<void>((resolve, reject) => {
        getOperations(process.env.POSTAL_CODE, (operations) => {
          const currentOutages = operations.open
          const plannedOutages = operations.future
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

  const missingSubscriptionVars = getMissingSubscriptionVariables()

  if (missingSubscriptionVars.length > 0) {
    console.info(
      "Skipping subscription check. Following environment variables are missing:",
      missingSubscriptionVars.join(", ")
    )
  } else {
    zonePromises.push(
      new Promise<void>((resolve, reject) => {
        getProducts(process.env.ADDRESS, async (data) => {
          const listedSubscription = getListedSubscription(
            data.products,
            currentSubscription.speed
          )

          if (!listedSubscription) {
            callback(
              "No subscriptions matches your current subscription or none are available on your address"
            )
          }

          if (listedSubscription.price < currentSubscription.price) {
            if (process.env.LOG_PRICES == "true") {
              await logPrice(currentSubscription, listedSubscription)
            }
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
    printMessage(message)
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

const CRON_SCHEDULE = process.env.CRON_SCHEDULE

if (CRON_SCHEDULE) {
  const startMessage =
    "Watchdog will start patrolling with the following interval: " +
    cronstrue.toString(CRON_SCHEDULE).toLowerCase()
  console.log(startMessage)
  if (process.env.SEND_STARTUP_MESSAGE == "true") {
    sendReport(startMessage, true)
  }
  const job = new CronJob(CRON_SCHEDULE, () => {
    doPatrol((report) => {
      sendReport(report)
    })
  })
  job.start()
} else {
  console.info(
    "Missing CRON_SCHEDULE environment variable. Only running patrol once..."
  )
  doPatrol((report) => {
    sendReport(report)
  })
}
