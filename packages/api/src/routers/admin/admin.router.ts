import { adminUserRouter } from "./sub-routers/adminUser/adminUser.router"
import { statisticsRouter } from "./sub-routers/statistics/statistics.router"
import { createTRPCRouter } from "../../trpc"

export const adminRouter = createTRPCRouter({
  users: adminUserRouter,
  statistics: statisticsRouter,
})
