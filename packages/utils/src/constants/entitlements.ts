/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
// TODO: Add Subscription model to schema
// import type { Subscription } from "@package/db"
type Subscription = any // Temporary placeholder

import {
  getSubscriptionPlanFromLookupKey,
  type SubscriptionPlanName,
} from "./subscriptionPlans"

/**
 * Add or remove features and usage limits here.
 */

// Example entitlements; modify as needed.
type EntitlementFeatures = {
  analytics: boolean // Feature gate
  clicks: number // Usage limit
}

type Entitlements = Record<SubscriptionPlanName, EntitlementFeatures>

export type CanAccessFeature = {
  subscriptionData: Subscription | null | undefined
  featureId: keyof EntitlementFeatures
  notSubscribedErorrMessage?: string
  noAccessErrorMessage?: string
}

export type IsUsageWithinLimit = CanAccessFeature & {
  usageIncrement: number
  usageCount: number
}

/**
 * Entitlements are the features and usage limits that a user has access to based on their subscription plan.
 *
 * They are defined in a object instead of the database to make it easier to manage and modify.
 * This makes changing them less rigid, as you can add or remove features and usage limits without needing to update the database.
 * Very useful if we want to make quick changes to the subscription plans.
 */

// Example entitlements for subscription plans; modify as needed.
export const entitlements: Entitlements = {
  BASIC: {
    // Feature gate entitlement
    analytics: false,
    // Usage entitlement
    clicks: 100,
  },
  PRO: {
    analytics: true,
    clicks: 500,
  },
  PREMIUM: {
    analytics: true,
    clicks: 1000,
  },
} as const

/**
 * Get entitlements for a subscription plan.
 */
function getEntitlements(plan: SubscriptionPlanName) {
  return entitlements[plan]
}

/**
 * Check if a user is currently subscribed.
 */
export function isSubscribed(subscription: Subscription | null | undefined) {
  if (
    !subscription ||
    !subscription.lookupKey ||
    !subscription.currentPeriodEnd
  ) {
    return false
  }

  const subscriptionHasNotEnded = subscription.currentPeriodEnd > new Date()
  const isSubscribed =
    (subscription.status === "active" || subscription.status === "trialing") &&
    subscriptionHasNotEnded

  return isSubscribed
}

/**
 * Check access to feature gates.
 *
 * This function is used to check if a user has access to a feature based on their subscription plan.
 *
 * @param subscriptionData The user's subscription data.
 * @param featureId The feature ID to check access for.
 * @param notSubscribedErorrMessage The error message to throw if the user is not subscribed.
 * @param noAccessErrorMessage The error message to throw if the user does not have access to the feature.
 */
export function ensureFeatureAccess({
  subscriptionData,
  featureId,
  notSubscribedErorrMessage,
  noAccessErrorMessage,
}: CanAccessFeature): void {
  if (!isSubscribed(subscriptionData)) {
    throw new Error(
      notSubscribedErorrMessage ??
        "You need to be subscribed to access this feature."
    )
  }

  const subscriptionPlan = getSubscriptionPlanFromLookupKey(
    subscriptionData?.lookupKey!
  )

  if (!subscriptionPlan) {
    throw new Error(
      "Subscription plan not found. Please contact support for assistance."
    )
  }

  const hasAccess = !!getEntitlements(subscriptionPlan.name)[featureId]

  if (!hasAccess) {
    throw new Error(
      noAccessErrorMessage ??
        "You don't have access to this feature with your current subscription."
    )
  }
}

/**
 * Check usage limits.
 *
 * This function is used to check if a user has reached their usage limit for a feature based on their subscription plan.
 * @param subscriptionData The user's subscription data.
 * @param featureId The feature ID to check usage for.
 * @param usageCount The current number of times the user has performed the action.
 * @param usageIncrement How much usage to add to the current usage after the performed action.
 * @param notSubscribedErorrMessage The error message to throw if the user is not subscribed.
 * @param noAccessErrorMessage The error message to throw if the user has reached their usage limit.
 */
export function ensureUsageWithinLimit({
  subscriptionData,
  featureId,
  usageCount,
  usageIncrement,
  notSubscribedErorrMessage,
  noAccessErrorMessage,
}: IsUsageWithinLimit): void {
  if (!isSubscribed(subscriptionData)) {
    throw new Error(
      notSubscribedErorrMessage ??
        "You need to be subscribed to access this feature."
    )
  }

  const subscriptionPlan = getSubscriptionPlanFromLookupKey(
    subscriptionData?.lookupKey!
  )

  if (!subscriptionPlan) {
    throw new Error(
      "Subscription plan not found. Please contact support for assistance."
    )
  }

  const limit = getEntitlements(subscriptionPlan.name)[featureId]

  if (typeof limit === "number") {
    const isWithinUsageLimit = usageIncrement + usageCount <= limit

    if (!isWithinUsageLimit) {
      throw new Error(
        noAccessErrorMessage ??
          "You have reached your usage limit for this feature."
      )
    }
  }
}
