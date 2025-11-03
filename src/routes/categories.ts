import { Router } from "express";
import { prisma } from "../database/prisma";

const router = Router();

// Listar todas as categorias
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
