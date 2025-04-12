import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Primero obtenemos el producto base
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        market: true,
        baseProduct: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Obtener todos los productos relacionados (mismo ProductBase)
    const relatedProducts = await prisma.product.findMany({
      where: {
        baseProductId: product.baseProductId,
        isAvailable: true,
      },
      include: {
        market: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Combinar todos los comentarios de los productos relacionados
    const allComments = relatedProducts.flatMap((p) => p.comments);

    // Calcular el promedio de valoraciones usando todos los comentarios
    const ratings = allComments.map((comment) => comment.rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    // Calcular la distribución de valoraciones
    const distribution = [5, 4, 3, 2, 1].map((stars) => {
      const count = ratings.filter((r) => r === stars).length;
      const percentage =
        ratings.length > 0 ? (count / ratings.length) * 100 : 0;
      return { estrellas: stars, porcentaje: Math.round(percentage) };
    });

    // Formatear la información de los mercados
    const markets = relatedProducts.map((p) => ({
      id: p.marketId,
      name: p.market.name,
      location: p.market.location,
      price: p.price,
      priceType: p.priceType,
      quantity: p.quantity,
      unit: p.unit,
      productId: p.id,
      image: p.image,
      images: p.images,
    }));

    // Obtener los mercados para cada comentario
    const commentsWithMarkets = await Promise.all(
      allComments.map(async (comment) => {
        const commentMarket = await prisma.market.findUnique({
          where: { id: comment.marketId },
        });
        return {
          ...comment,
          market: commentMarket,
        };
      })
    );

    const formattedProduct = {
      ...product,
      markets,
      comments: commentsWithMarkets,
      valoraciones: {
        promedio: Number(averageRating.toFixed(1)),
        total: ratings.length,
        distribucion: distribution,
      },
    };

    return res.status(200).json(formattedProduct);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    return res.status(500).json({ error: "Error al obtener el producto" });
  }
}
