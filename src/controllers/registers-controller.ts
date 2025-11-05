import { Request, Response, NextFunction } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";

class RegistersController {
  async index(request: Request, response: Response, next: NextFunction) {
    try {
      const paramsSchema = z.object({
        category_id: z.string().uuid(),
      });

      const { category_id } = paramsSchema.parse(request.params);

      const discoveries = await prisma.discovery.findMany({
        where: { categories: { some: { id: category_id } } },
        orderBy: { title: "asc" },
      });

      return response.json(discoveries);
    } catch (error) {
      next(error);
    }
  }

  async show(request: Request, response: Response, next: NextFunction) {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = paramsSchema.parse(request.params);

      const discovery = await prisma.discovery.findUnique({
        where: { id },
        include: {
          categories: true,
        },
      });

      return response.json(discovery);
    } catch (error) {
      next(error);
    }
  }
}

export { RegistersController };
