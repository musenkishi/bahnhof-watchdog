import dotenv from "dotenv"
import express from "express"
import { getProducts, getOperations, sendWebhook } from "./api/api"
import { sendMail } from "./api/mail"
import {
  generateOutageMessage,
  generateSubscriptionMessage,
} from "./util/message"
import { findProductAndConvertWithReduce as getListedSubscription } from "./util/product"
import cron from "node-cron"

//Load variables from .env file
dotenv.config()
const app = express()
const port = 3000

const currentSubscription = {
  name: process.env.CURRENT_PRODUCT,
  price: Number.parseInt(process.env.CURRENT_PRICE),
}

app.get("/", (req, res) => {
  doPatrol((message) => {
    sendWebhook(message)
    res.send(message)
  })
})

app.get("/send", (req, res) => {
  sendMail(
    {
      user: process.env.SERVER_MAIL,
      pass: process.env.SERVER_MAIL_PASS,
    },
    req.query.mail as string,
    (error, info) => {
      if (error) {
        res.send(error)
      } else {
        res.send("Mail sent! " + info.response)
      }
    }
  )
})

app.listen(port, () => {
  return console.log("Express is listening at http://localhost:" + port)
})

const cronInterval = process.env.CRON_SCHEDULE

if (cronInterval) {
  cron.schedule(cronInterval, () => {
    console.log("cron schedule running with interval: " + cronInterval)
    // TODO: doPatrol() but only after you save what message has already been sent
  })
}

const doPatrol = (callback: (message: string) => void) => {
  getOperations(process.env.POSTAL_CODE, (operations) => {
    const currentOutages = operations.data.open
    const plannedOutages = operations.data.future
    if (currentOutages.length > 0 || plannedOutages.length > 0) {
      const message = generateOutageMessage(currentOutages, plannedOutages)
      callback(message)
    }
  })

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
  })
}
