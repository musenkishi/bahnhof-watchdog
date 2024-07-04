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

//Load variables from .env file
dotenv.config()

const currentSubscription = {
  name: process.env.CURRENT_PRODUCT,
  price: Number.parseInt(process.env.CURRENT_PRICE),
}

const cronInterval = process.env.CRON_SCHEDULE

if (cronInterval) {
  cron.schedule(cronInterval, () => {
    console.log("cron schedule running with interval: " + cronInterval)
    doPatrol((report) => {
      sendReport(report)
    })
  })
}

const doPatrol = async (callback: (report: string) => void) => {
  console.log("Watchdog started its patrol.")

  const operationPromise = new Promise<void>((resolve, reject) => {
    getOperations(process.env.POSTAL_CODE, (operations) => {
      const currentOutages = operations.data.open
      const plannedOutages = operations.data.future
      if (currentOutages.length > 0 || plannedOutages.length > 0) {
        const message = generateOutageMessage(currentOutages, plannedOutages)
        callback(message)
      }
      resolve()
    })
  })

  const productsPromise = new Promise<void>((resolve, reject) => {
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

  await Promise.all([operationPromise, productsPromise])

  console.log("Watchdog has completed its patrol.")
}

const sendReport = (report: string) => {
  if (!report) return

  handleBuffer(report, () => {
    sendWebhook(report)
    sendMail(report)
  })
}
