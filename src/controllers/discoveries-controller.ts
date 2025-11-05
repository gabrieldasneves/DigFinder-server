import { Request, Response, NextFunction } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";

const discoverySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  latitude: z.number(),
  longitude: z.number(),
  discoveryDate: z.string(),
  categoryIds: z.array(z.string().uuid()),
});

class DiscoveriesController {
  async createDiscovery(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const {
        title,
        description,
        latitude,
        longitude,
        discoveryDate,
        categoryIds,
      } = discoverySchema.parse(request.body);
      const userId = request.user.id;

      const discovery = await prisma.discovery.create({
        data: {
          title,
          description,
          latitude,
          longitude,
          discoveryDate,
          userId,
          categories: {
            connect: categoryIds.map((id) => ({ id })),
          },
        },
        include: {
          categories: true,
        },
      });

      return response.status(201).json(discovery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ error: error.errors });
      }
      return response.status(500).json({ error: "Internal server error" });
    }
  }

  async getDiscoveryById(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const { id } = request.params;
      const userId = request.user.id;

      const discovery = await prisma.discovery.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          categories: true,
        },
      });

      if (!discovery) {
        return response.status(404).json({ error: "Discovery not found" });
      }

      return response.json(discovery);
    } catch (error) {
      return response.status(500).json({ error: "Internal server error" });
    }
  }

  async getDiscoveries(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const userId = request.user.id;
      const discoveries = await prisma.discovery.findMany({
        where: { userId },
        include: {
          categories: true,
        },
      });

      return response.json(discoveries);
    } catch (error) {
      return response.status(500).json({ error: "Internal server error" });
    }
  }

  async updateDiscovery(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const { id } = request.params;
      const userId = request.user.id;
      const {
        title,
        description,
        latitude,
        longitude,
        discoveryDate,
        categoryIds,
      } = discoverySchema.parse(request.body);

      const discovery = await prisma.discovery.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!discovery) {
        return response.status(404).json({ error: "Discovery not found" });
      }

      const updatedDiscovery = await prisma.discovery.update({
        where: { id },
        data: {
          title,
          description,
          latitude,
          longitude,
          discoveryDate,
          categories: {
            set: categoryIds.map((id) => ({ id })),
          },
        },
        include: {
          categories: true,
        },
      });

      return response.json(updatedDiscovery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ error: error.errors });
      }
      return response.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteDiscovery(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const { id } = request.params;
      const userId = request.user.id;

      const discovery = await prisma.discovery.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!discovery) {
        return response.status(404).json({ error: "Discovery not found" });
      }

      await prisma.discovery.delete({
        where: { id },
      });

      return response.status(204).send();
    } catch (error) {
      return response.status(500).json({ error: "Internal server error" });
    }
  }
}

export { DiscoveriesController };
