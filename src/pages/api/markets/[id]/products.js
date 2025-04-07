import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  try {
    const products = await prisma.product.findMany({
      where: { marketId: id },
      include: {
        comments: true,
      },
    });

    // Calcular rating promedio para cada producto
    const productsWithRating = products.map((product) => {
      const averageRating =
        product.comments.reduce((acc, comment) => acc + comment.rating, 0) /
        product.comments.length;
      return {
        ...product,
        rating: isNaN(averageRating) ? null : averageRating.toFixed(1),
        // Convertir objetos Date a strings para evitar errores de serialización
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        comments: product.comments.map((comment) => ({
          ...comment,
          createdAt: comment.createdAt.toISOString(),
        })),
      };
    });

    res.status(200).json({
      products: productsWithRating,
    });
  } catch (error) {
    console.error("Error fetching market products:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los productos del mercado" });
  } finally {
    await prisma.$disconnect();
  }
}
