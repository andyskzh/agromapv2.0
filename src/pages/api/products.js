import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const products = await prisma.product.findMany({
      include: {
        market: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        comments: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Calcular la valoración promedio para cada producto
    const productsWithRating = products.map((product) => {
      const ratings = product.comments.map((comment) => comment.rating);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null;

      return {
        ...product,
        rating: averageRating,
        comments: undefined, // No necesitamos enviar todos los comentarios
      };
    });

    return res.status(200).json({
      products: productsWithRating,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).json({
      message: "Error al obtener los productos",
    });
  }
}
