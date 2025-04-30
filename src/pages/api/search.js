import { prisma } from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }

  try {
    const [products, markets] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          market: true,
          comments: true,
        },
        take: 50,
      }),
      prisma.market.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
    ]);

    // Calcular la valoración promedio para cada producto
    const productsWithRating = products.map((product) => ({
      ...product,
      rating:
        product.comments.length > 0
          ? product.comments.reduce((acc, comment) => acc + comment.rating, 0) /
            product.comments.length
          : 0,
    }));

    return res.status(200).json({
      products: productsWithRating,
      markets,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Error performing search" });
  }
}
