import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cities = ["Paris", "Tokyo", "Lisbon", "Reykjavik", "New York"];

  for (const city of cities) {
    await prisma.photoSpot.createMany({
      data: [
        {
          city,
          name: "Golden Hour Viewpoint",
          description: "A scenic spot that looks amazing at sunset.",
          latitude: null,
          longitude: null,
          sampleImageUrl:
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60",
          tags: ["sunset", "viewpoint", "cityscape"],
        },
        {
          city,
          name: "Hidden Alley",
          description: "Quiet backstreet with beautiful textures and light.",
          latitude: null,
          longitude: null,
          sampleImageUrl:
            "https://images.unsplash.com/photo-1520975958225-77c5d0987fcb?auto=format&fit=crop&w=1200&q=60",
          tags: ["street", "architecture"],
        },
      ],
      skipDuplicates: true,
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

