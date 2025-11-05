import { Router } from "express";
import { z } from "zod";
import { prisma } from "../database/prisma";
import { authenticateToken } from "@/middlewares/authenticate";
import { Discovery } from "@prisma/client";
import { DiscoveriesController } from "@/controllers/discoveries-controller";

const router = Router();

const discoveriesController = new DiscoveriesController();

router.post("/", authenticateToken, discoveriesController.createDiscovery);

router.get("/", authenticateToken, discoveriesController.getDiscoveries);

router.get("/:id", authenticateToken, discoveriesController.getDiscoveryById);

router.put("/:id", authenticateToken, discoveriesController.updateDiscovery);

router.delete("/:id", authenticateToken, discoveriesController.deleteDiscovery);

export { router as discoveriesRoutes };
