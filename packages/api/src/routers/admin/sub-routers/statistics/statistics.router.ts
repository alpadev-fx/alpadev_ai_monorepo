import { userStatisticsInput } from "./service/statistics.input"
import { statisticsService } from "./service/statistics.service"
import { adminProcedure, createTRPCRouter } from "../../../../trpc"

export const statisticsRouter = createTRPCRouter({
  subscriptions: adminProcedure.query(() => {
    return statisticsService.getSubscriptionStatistics()
  }),
  users: adminProcedure.input(userStatisticsInput).query(({ input }) => {
    return statisticsService.getUsersStatistics({ input })
  }),
})
