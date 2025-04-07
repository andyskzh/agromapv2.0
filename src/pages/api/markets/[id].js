import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  try {
    const market = await prisma.market.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            comments: true,
          },
        },
      },
    });

    if (!market) {
      return res.status(404).json({ message: "Mercado no encontrado" });
    }

    // Calcular rating promedio para cada producto
    const productsWithRating = market.products.map((product) => {
      const averageRating =
        product.comments.reduce((acc, comment) => acc + comment.rating, 0) /
        product.comments.length;
      return {
        ...product,
        rating: isNaN(averageRating) ? null : averageRating.toFixed(1),
      };
    });

    res.status(200).json({
      market: {
        ...market,
        products: productsWithRating,
      },
    });
  } catch (error) {
    console.error("Error fetching market:", error);
    res.status(500).json({ message: "Error al obtener el mercado" });
  } finally {
    await prisma.$disconnect();
  }
}
