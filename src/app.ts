import dotenv from "dotenv"
import express from "express"
import { getProducts, getOperations, sendWebhook } from "./api/api"
import { sendMail } from "./api/mail"
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
  // getOperations(process.env.POSTAL_CODE, (operations) => {
  //   res.send(operations)
  // })

  getProducts(process.env.ADDRESS, (result) => {
    const findSubscription = result.data.products.find((product) =>
      product.internalTitle.includes(currentSubscription.name)
    )
    if (!findSubscription) {
      res.send(
        "No subscriptions matches your current subscription or none are available on your address"
      )
      return
    }

    if (findSubscription.price < currentSubscription.price) {
      const response = {
        message:
          "Your current subscription is priced higher than it is on bahnhof's website. Contact them for a price reduction!",
        currentSubscription: currentSubscription,
        availableSubscrition: findSubscription,
      }
      res.send(response)
      sendWebhook(response.message)
      return
    }

    res.send(result)
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

// //Fires every minute
// cron.schedule("* * * * *", () => {

//   runOperationsTest();
// });

const runOperationsTest = () => {
  console.log("Executing scheduled job")
  getOperations(process.env.POSTAL_CODE, (operations) => {
    return operations
    // const result = operations.data.all.filter((operation) =>
    //   operation.title.includes("Östersund" || "Lärbro")
    // )

    // console.log("Found", result || "nothing")
    console.log("Result:")
    console.log(JSON.stringify(operations.data.all))
  })
}
// function runOperationsTest() {
// }

// runOperationsTest()
