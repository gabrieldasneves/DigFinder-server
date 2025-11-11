import { Router } from "express";
import { z } from "zod";
import { prisma } from "../database/prisma";
import { authenticateToken } from "@/middlewares/authenticate";
import { Discovery } from "@prisma/client";
import { DiscoveriesController } from "@/controllers/discoveries-controller";

const discoveriesRoutes = Router();

const discoveriesController = new DiscoveriesController();

discoveriesRoutes.post(
  "/createDiscovery",
  authenticateToken,
  discoveriesController.createDiscovery
);

discoveriesRoutes.get(
  "/getDiscoveries",
  authenticateToken,
  discoveriesController.getDiscoveries
);

discoveriesRoutes.get(
  "/getDiscoveryById/:id",
  authenticateToken,
  discoveriesController.getDiscoveryById
);

discoveriesRoutes.put(
  "/updateDiscovery/:id",
  authenticateToken,
  discoveriesController.updateDiscovery
);

discoveriesRoutes.delete(
  "/deleteDiscovery/:id",
  authenticateToken,
  discoveriesController.deleteDiscovery
);

export { discoveriesRoutes };
