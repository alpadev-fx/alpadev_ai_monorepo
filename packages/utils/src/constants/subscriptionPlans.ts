/**
 * The name of your subscription plans.
 */
export enum SubscriptionPlanName {
  BASIC = "BASIC",
  PRO = "PRO",
  PREMIUM = "PREMIUM",
}

export type SubscriptionPlan = {
  name: SubscriptionPlanName
  tagline: string
  price: {
    monthly: number
    yearly: number
  }
  lookupKeys: {
    monthly: string
    yearly: string
  }
  color: string
  buttonClassName: string
  features: { name: string; included: boolean }[]
}

const isDevelopment = process.env.NEXT_PUBLIC_APP_ENV === "development"

/**
 * Subscription plans.
 *
 * @property name - The name of the subscription plan.
 * @property tagline - A short description of the subscription plan.
 * @property price - The monthly and yearly price of the subscription plan.
 * @property lookupKeys - The lookup keys for the subscription plan. This is either the stripe lookup key or lemonsqueezy variant id. The isDevelopment flag is used to determine which lookup key to use depending on the environment. For stripe, you can use the same lookup key for both development and production. However, for lemonsqueezy, a new variant id is created for each environment.
 * @property features - All features included and not included in the subscription plan.
 * @property color - The background color of the circle beside the subscription plan name.
 * @property buttonClassName - The classnames for the button.
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: SubscriptionPlanName.BASIC,
    tagline: "For hobby & side projects",
    price: { monthly: 9, yearly: 7 },
    // This is either stripe lookup key or lemonsqueezy variant id
    lookupKeys: {
      monthly: isDevelopment ? "BASIC_MONTHLY" : "BASIC_MONTHLY",
      yearly: isDevelopment ? "BASIC_YEARLY" : "BASIC_YEARLY",
    },
    features: [
      { name: "Feature 1", included: true },
      { name: "Feature 2", included: true },
      { name: "Feature 3", included: true },
      { name: "Feature 4", included: false },
      { name: "Feature 5", included: false },
      { name: "Feature 6", included: false },
    ],
    color: "bg-primary",
    buttonClassName: "w-full font-bold",
  },
  {
    name: SubscriptionPlanName.PRO,
    tagline: "For startups & small businesses",
    price: { monthly: 24, yearly: 19 },
    lookupKeys: {
      monthly: isDevelopment ? "PRO_MONTHLY" : "PRO_MONTHLY",
      yearly: isDevelopment ? "PRO_YEARLY" : "PRO_YEARLY",
    },
    features: [
      { name: "Feature 1", included: true },
      { name: "Feature 2", included: true },
      { name: "Feature 3", included: true },
      { name: "Feature 4", included: true },
      { name: "Feature 5", included: true },
      { name: "Feature 6", included: false },
    ],
    color: "bg-purple-400",
    buttonClassName: "w-full bg-purple-400 font-bold hover:bg-purple-400/75",
  },
  {
    name: SubscriptionPlanName.PREMIUM,
    tagline: "For larger teams with increased ",
    price: { monthly: 49, yearly: 39 },
    lookupKeys: {
      monthly: isDevelopment ? "PREMIUM_MONTHLY" : "PREMIUM_MONTHLY",
      yearly: isDevelopment ? "PREMIUM_YEARLY" : "PREMIUM_YEARLY",
    },
    features: [
      { name: "Feature 1", included: true },
      { name: "Feature 2", included: true },
      { name: "Feature 3", included: true },
      { name: "Feature 4", included: true },
      { name: "Feature 5", included: true },
      { name: "Feature 6", included: true },
    ],
    color: "bg-blue-400",
    buttonClassName: "w-full bg-blue-400 font-bold hover:bg-blue-400/75",
  },
] as const

/**
 * Get a subscription plan from a lookup key.
 */
export function getSubscriptionPlanFromLookupKey(lookupKey: string) {
  return SUBSCRIPTION_PLANS.find((plan) =>
    Object.values(plan.lookupKeys).some((value) => value === lookupKey)
  )
}
