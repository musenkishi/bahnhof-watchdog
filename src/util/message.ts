import { Operation } from "../types/operation"
import { Subscription } from "../types/subscription"

export const generateSubscriptionMessage = (
  currentSubscription: Subscription,
  listedSubscription: Subscription
): string =>
  `Your current subscription (${currentSubscription.speed} Mbit for ${currentSubscription.price} kr) is listed at ${listedSubscription.price} kr on bahnhof's website. Contact them for a price reduction!`

export const generateOutageMessage = (
  currentOutages: Operation[],
  plannedOutages: Operation[]
): string => {
  const array = []

  if (currentOutages.length > 0) {
    const currentString = `
    There are ${currentOutages.length} outages in your area at the moment:
    ${renderOutages(currentOutages)}`
    array.push(currentString)
  }
  if (plannedOutages.length > 0) {
    const plannedString = `
    There are ${plannedOutages.length} outages planned in your area:
    ${renderOutages(plannedOutages)}`
    array.push(plannedString)
  }
  return array.toString()
}

const renderOutages = (outages: Operation[]) =>
  outages.map(
    (outage) => `
<h2>${outage.title}</h2>
${outage.messages.map((message) => message.message)}
`
  )
