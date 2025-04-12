import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { id } = req.query;

    // Obtener el producto específico con su mercado y producto base
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        market: true,
        baseProduct: {
          select: {
            id: true,
            name: true,
            category: true,
            nutrition: true,
            image: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            market: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Calcular valoraciones
    const ratings = product.comments.map((comment) => ({
      id: comment.id,
      rating: comment.rating,
      user: comment.user,
    }));
    const totalRatings = ratings.length;
    const avgRating =
      totalRatings > 0
        ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings
        : 0;

    // Calcular distribución de valoraciones
    const ratingDistribution = [0, 0, 0, 0, 0];
    ratings.forEach((rating) => {
      if (rating.rating >= 1 && rating.rating <= 5) {
        ratingDistribution[rating.rating - 1]++;
      }
    });

    const formattedProduct = {
      ...product,
      images: product.images || [], // Asegurarnos de que siempre sea un array
      valoraciones: {
        promedio: Number(avgRating.toFixed(1)),
        total: totalRatings,
        distribucion: ratingDistribution.map((count, index) => ({
          estrellas: index + 1,
          cantidad: count,
          porcentaje:
            totalRatings > 0 ? ((count / totalRatings) * 100).toFixed(0) : 0,
        })),
      },
      comments: product.comments.filter(
        (comment) => comment.content && comment.content.trim() !== ""
      ),
    };

    return res.status(200).json(formattedProduct);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    return res.status(500).json({ error: "Error al obtener el producto" });
  }
}
