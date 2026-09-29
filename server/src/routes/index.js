import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import propertyRoutes from "../modules/properties/property.routes.js";
import projectRoutes from "../modules/projects/project.routes.js";
import agentRoutes from "../modules/agents/agent.routes.js";
import favoriteRoutes from "../modules/favorites/favorite.routes.js";
import bookingRoutes from "../modules/bookings/booking.routes.js";
import transactionRoutes from "../modules/transactions/transaction.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import notificationRoutes from "../modules/notifications/notification.routes.js";
import catalogRoutes from "../modules/catalog/catalog.routes.js";
import contactRoutes from "../modules/contact/contact.routes.js";
import platformRoutes from "../modules/platform/platform.routes.js";
import { isDBConnected } from "../config/db.js";
import { ApiResponse } from "../shared/ApiResponse.js";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     operationId: getHealth
 *     summary: Health check
 *     description: Returns service health status including MongoDB connectivity. Returns 503 when MongoDB is disconnected.
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
      },
    },
    dbConnected ? "Service is healthy" : "Service degraded",
    dbConnected ? 200 : 503,
  );
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/properties", propertyRoutes);
router.use("/projects", projectRoutes);
router.use("/agents", agentRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/bookings", bookingRoutes);
router.use("/transactions", transactionRoutes);
router.use("/admin", adminRoutes);
router.use("/notifications", notificationRoutes);
router.use("/catalog", catalogRoutes);
router.use("/contact", contactRoutes);
router.use("/platform", platformRoutes);

export default router;
