import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import propertyRoutes from "../modules/properties/property.routes.js";
import agentRoutes from "../modules/agents/agent.routes.js";
import favoriteRoutes from "../modules/favorites/favorite.routes.js";
import bookingRoutes from "../modules/bookings/booking.routes.js";
import transactionRoutes from "../modules/transactions/transaction.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import notificationRoutes from "../modules/notifications/notification.routes.js";
import { isDBConnected } from "../config/db.js";
import { isRedisConnected } from "../config/redis.js";
import { ApiResponse } from "../shared/ApiResponse.js";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health status
 */
router.get("/health", (req, res) => {
  const healthy = isDBConnected();
  ApiResponse.success(
    res,
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      services: {
        mongodb: isDBConnected() ? "connected" : "disconnected",
        redis: isRedisConnected() ? "connected" : "not_configured",
      },
    },
    healthy ? "Service is healthy" : "Service degraded",
    healthy ? 200 : 503,
  );
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/properties", propertyRoutes);
router.use("/agents", agentRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/bookings", bookingRoutes);
router.use("/transactions", transactionRoutes);
router.use("/admin", adminRoutes);
router.use("/notifications", notificationRoutes);

export default router;
