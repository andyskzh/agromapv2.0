import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const markets = await prisma.market.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        latitude: true,
        longitude: true,
        image: true,
      },
    });

    res.status(200).json(markets);
  } catch (error) {
    console.error("Error fetching markets:", error);
    res.status(500).json({ message: "Error fetching markets" });
  }
}
