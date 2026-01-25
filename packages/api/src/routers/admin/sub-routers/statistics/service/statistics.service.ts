import {
  convertDateToFullYear,
  getAllDaysBetweenTwoDates,
  getSubscriptionPlanFromLookupKey,
  SubscriptionPlanName,
} from "@package/utils"
import { format } from "date-fns"

import type {
  GetUsersStatisticsArgs,
  Subscriptions,
  SubscriptionsWithLookupKey,
  UsersAndDaysBetween,
  UsersCreatedAt,
} from "./statistics.service.types"
import type { SubscriptionStatus } from "@package/db"

import { statisticsRepository } from "../repository/statistics.repository"

class StatisticsService {
  public async getSubscriptionStatistics() {
    // TODO: Add subscription model to schema
    return {
      subscriptionCounts: {},
      subscriptionStatistics: [],
    }
    // const subscriptions = await statisticsRepository.getSubscriptionStatistics()

    // const subscriptionsWithPlanName =
    //   this.getSubscriptionsWithPlanName(subscriptions)

    // const subscriptionCounts = this.calculateSubscriptionCounts(
    //   subscriptionsWithPlanName
    // )

    // const subscriptionStatistics = this.generateSubscriptionChartData(
    //   subscriptionsWithPlanName
    // )

    // return { subscriptionStatistics, subscriptionCounts }
  }

  public async getUsersStatistics(args: GetUsersStatisticsArgs) {
    const allDaysBetween = getAllDaysBetweenTwoDates(
      args.input.from,
      args.input.to
    )

    const users = await statisticsRepository.getUsersStatistics(args.input)

    const totalUserStatistics = this.generateTotalUsersChartData({
      users,
      allDaysBetween,
    })
    const newUserStatistics = this.generateNewUsersChartData({
      users,
      allDaysBetween,
    })

    return { totalUserStatistics, newUserStatistics }
  }

  // Private helper methods
  private getSubscriptionsWithPlanName(
    subscriptions: SubscriptionsWithLookupKey
  ) {
    return subscriptions.map((subscription) => {
      const subscriptionPlan = getSubscriptionPlanFromLookupKey(
        subscription.lookupKey ?? ""
      )

      return {
        subscriptionPlan: subscriptionPlan?.name ?? null,
        status: subscription.status,
      }
    })
  }

  private calculateSubscriptionCounts(subscriptions: Subscriptions) {
    const totalTrials = subscriptions.filter(
      (subscription) => subscription.status === "trialing"
    ).length
    const totalActive = subscriptions.filter(
      (subscription) => subscription.status === "active"
    ).length
    const totalSubscriptions = subscriptions.filter(
      (subscription) => subscription.subscriptionPlan
    ).length

    return { totalTrials, totalActive, totalSubscriptions }
  }

  private generateSubscriptionChartData(subscriptions: Subscriptions) {
    const initialSubscriptionStatusCounts: Record<SubscriptionStatus, number> =
      {
        active: 0,
        trialing: 0,
        canceled: 0,
        unpaid: 0,
        past_due: 0,
        incomplete: 0,
        incomplete_expired: 0,
        paused: 0,
        expired: 0,
      }

    const subscriptionStatusCounts = Object.keys(SubscriptionPlanName).map(
      (subscriptionPlan) => {
        return {
          ...initialSubscriptionStatusCounts,
          name: subscriptionPlan,
        }
      }
    )

    subscriptions.forEach((subscription) => {
      if (!subscription.subscriptionPlan || !subscription.status) return

      const subscriptionStatusCount = subscriptionStatusCounts.find(
        (item) => item.name === subscription.subscriptionPlan
      )

      if (subscriptionStatusCount) {
        subscriptionStatusCount[subscription.status] += 1
      }
    })

    return subscriptionStatusCounts
  }

  private groupUsersByCreationDate(users: UsersCreatedAt) {
    return users.reduce(
      (acc, user) => {
        const date = convertDateToFullYear(user.createdAt)
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date]++
        return acc
      },
      {} as Record<string, number>
    )
  }

  private convertToNamedAmountArray(
    allDaysBetween: Date[],
    usersByDate: Record<string, number>
  ) {
    return allDaysBetween.map((date) => {
      const dateString = format(date, "yyyy-MM-dd")
      return {
        name: dateString,
        users: usersByDate[dateString] || 0,
      }
    })
  }

  private generateTotalUsersChartData({
    allDaysBetween,
    users,
  }: UsersAndDaysBetween) {
    // Group users by date
    const usersByDate = users.reduce<Record<string, number>>((acc, user) => {
      const date = format(user.createdAt, "yyyy-MM-dd")
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Convert the grouped data to chart data
    let totalUsers = 0

    return allDaysBetween.map((date) => {
      const dateString = format(date, "yyyy-MM-dd")
      totalUsers += usersByDate[dateString] || 0
      return {
        name: dateString,
        users: totalUsers,
      }
    })
  }

  private generateNewUsersChartData(data: UsersAndDaysBetween) {
    const usersByDate = this.groupUsersByCreationDate(data.users)
    const chartData = this.convertToNamedAmountArray(
      data.allDaysBetween,
      usersByDate
    )

    return chartData
  }
}

export const statisticsService = new StatisticsService()
