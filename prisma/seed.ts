/// <reference types="node" />
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: "Body Fossils",
      description:
        "Preserved parts of an organism's body, like bones, teeth, or shells.",
    },
    {
      name: "Trace Fossils",
      description:
        "Evidence of an organism's activity, such as footprints, burrows, or trails.",
    },
    {
      name: "Molds and Casts",
      description:
        "Impressions (molds) or replicas (casts) of organisms left in sediment.",
    },
    {
      name: "Permineralized Fossils",
      description:
        "Fossils where minerals have filled in the cellular spaces, preserving fine details.",
    },
    {
      name: "Amber Fossils",
      description:
        "Organisms trapped and preserved in fossilized tree resin (amber).",
    },
    {
      name: "Carbon Film Fossils",
      description:
        "Thin films of carbon left behind by organisms, often preserving fine details.",
    },
    {
      name: "Recrystallized Fossils",
      description:
        "Fossils where original materials were replaced by new minerals, altering texture but preserving shape.",
    },
    {
      name: "Coprolites",
      description:
        "Fossilized feces that give insight into ancient diets and ecosystems.",
    },
    {
      name: "Gastroliths",
      description:
        "Polished stones once used by animals (like dinosaurs) to grind food in the stomach.",
    },
    {
      name: "Others",
      description:
        "Other types of fossils or fossil-related discoveries that don't fit into the main categories.",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log("Categories seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
