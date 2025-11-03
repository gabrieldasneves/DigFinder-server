import { Router } from "express";
import { z } from "zod";
import { prisma } from "../database/prisma";
import { authenticateToken } from "@/middlewares/authenticate";
import { Discovery } from "@prisma/client";

const router = Router();

// Schema para validação de descoberta
const discoverySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  latitude: z.number(),
  longitude: z.number(),
  discoveryDate: z.string(),
  categoryIds: z.array(z.string().uuid()),
});

// Criar uma nova descoberta
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      latitude,
      longitude,
      discoveryDate,
      categoryIds,
    } = discoverySchema.parse(req.body);
    const userId = req.user.id;

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

    return res.status(201).json(discovery);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Listar todas as descobertas do usuário
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const discoveries = await prisma.discovery.findMany({
      where: { userId },
      include: {
        categories: true,
      },
    });

    return res.json(discoveries);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Buscar uma descoberta específica
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

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
      return res.status(404).json({ error: "Discovery not found" });
    }

    return res.json(discovery);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Atualizar uma descoberta
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      title,
      description,
      latitude,
      longitude,
      discoveryDate,
      categoryIds,
    } = discoverySchema.parse(req.body);

    const discovery = await prisma.discovery.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!discovery) {
      return res.status(404).json({ error: "Discovery not found" });
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

    return res.json(updatedDiscovery);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Deletar uma descoberta
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const discovery = await prisma.discovery.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!discovery) {
      return res.status(404).json({ error: "Discovery not found" });
    }

    await prisma.discovery.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
