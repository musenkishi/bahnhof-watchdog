import { Subscription } from "../types/subscription"

export const generateMessage = (
  currentSubscription: Subscription,
  listedSubscription: Subscription
): string =>
  `Your current subscription (${currentSubscription.name} Mbit for ${currentSubscription.price} kr) is listed at ${listedSubscription.price} kr on bahnhof's website. Contact them for a price reduction!`
