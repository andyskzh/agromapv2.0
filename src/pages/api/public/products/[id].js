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
        comments: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Luego buscamos todos los productos con el mismo baseProductId
    const relatedProducts = await prisma.product.findMany({
      where: {
        baseProductId: product.baseProductId,
        isAvailable: true,
        NOT: {
          id: product.id, // Excluimos el producto actual
        },
      },
      include: {
        market: true,
      },
    });

    // Combinamos el producto actual con los relacionados para la lista de mercados
    const allProducts = [product, ...relatedProducts];

    // Formatear la información de los mercados
    const markets = allProducts.map((p) => ({
      id: p.marketId,
      name: p.market.name,
      location: p.market.location,
      price: p.price,
      priceType: p.priceType,
      quantity: p.quantity,
      unit: p.unit,
    }));

    // Calcular el promedio de valoraciones
    const ratings = product.comments.map((comment) => comment.rating);
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

    // Obtener los mercados para cada comentario
    const commentsWithMarkets = await Promise.all(
      product.comments.map(async (comment) => {
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
