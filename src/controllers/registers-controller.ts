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

      const registers = await prisma.register.findMany({
        where: { categoryId: category_id },
        orderBy: { name: "asc" },
      });

      return response.json(registers);
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

      const register = await prisma.register.findUnique({
        where: { id },
        include: {
          rules: true,
        },
      });

      return response.json(register);
    } catch (error) {
      next(error);
    }
  }
}

export { RegistersController };
