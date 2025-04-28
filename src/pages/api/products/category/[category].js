import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ message: "Categoría no especificada" });
  }

  // Convertir la categoría de la URL a mayúsculas para coincidir con el enum
  const categoryEnum = category.toUpperCase();

  try {
    const products = await prisma.product.findMany({
      where: {
        category: categoryEnum,
      },
      select: {
        id: true,
        name: true,
        description: true,
        quantity: true,
        image: true,
        images: true,
        isAvailable: true,
        sasProgram: true,
        price: true,
        priceType: true,
        unit: true,
        category: true,
        market: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        baseProduct: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Agrupar productos por baseProductId para encontrar todos los mercados donde está disponible
    const productsByBase = {};
    products.forEach((product) => {
      if (product.baseProductId) {
        if (!productsByBase[product.baseProductId]) {
          productsByBase[product.baseProductId] = [];
        }
        productsByBase[product.baseProductId].push(product);
      }
    });

    // Calcular la valoración promedio y agregar los mercados disponibles para cada producto
    const productsWithRating = products.map((product) => {
      const ratings = product.comments.map((comment) => comment.rating);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null;

      // Obtener todos los mercados donde está disponible este producto
      const availableMarkets = product.baseProductId
        ? productsByBase[product.baseProductId].map((p) => ({
            id: p.market.id,
            name: p.market.name,
            location: p.market.location,
          }))
        : [
            {
              id: product.market.id,
              name: product.market.name,
              location: product.market.location,
            },
          ];

      return {
        ...product,
        rating: averageRating,
        markets: availableMarkets,
        comments: undefined, // No necesitamos enviar todos los comentarios
      };
    });

    return res.status(200).json({
      products: productsWithRating,
    });
  } catch (error) {
    console.error("Error al obtener productos por categoría:", error);
    return res.status(500).json({
      message: "Error al obtener los productos",
    });
  } finally {
    await prisma.$disconnect();
  }
}
