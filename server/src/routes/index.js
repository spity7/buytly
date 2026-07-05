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
import { getRedisStatus } from "../config/redis.js";
import { ApiResponse } from "../shared/ApiResponse.js";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     operationId: getHealth
 *     summary: Health check
 *     description: Returns service health status including MongoDB and Redis connectivity. Returns 503 when MongoDB is disconnected.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthSuccessResponse'
 *             example:
 *               success: true
 *               message: Service is healthy
 *               data:
 *                 status: ok
 *                 timestamp: '2026-07-05T09:00:00.000Z'
 *                 services:
 *                   mongodb: connected
 *                   redis: not_configured
 *       503:
 *         description: Service degraded (MongoDB disconnected)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthSuccessResponse'
 *             example:
 *               success: true
 *               message: Service degraded
 *               data:
 *                 status: degraded
 *                 timestamp: '2026-07-05T09:00:00.000Z'
 *                 services:
 *                   mongodb: disconnected
 *                   redis: not_configured
 */
router.get("/health", (req, res) => {
  const dbConnected = isDBConnected();
  ApiResponse.success(
    res,
    {
      status: dbConnected ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      services: {
        mongodb: dbConnected ? "connected" : "disconnected",
        redis: getRedisStatus(),
      },
    },
    dbConnected ? "Service is healthy" : "Service degraded",
    dbConnected ? 200 : 503,
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
