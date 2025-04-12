import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
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

    // Agregar los mercados disponibles para cada producto
    const productsWithMarkets = products.map((product) => {
      const availableMarkets = product.baseProductId
        ? productsByBase[product.baseProductId].map((p) => ({
            id: p.market.id,
            name: p.market.name,
            location: p.market.location,
            productId: p.id,
          }))
        : [
            {
              id: product.market.id,
              name: product.market.name,
              location: product.market.location,
              productId: product.id,
            },
          ];

      return {
        ...product,
        markets: availableMarkets,
      };
    });

    return res.status(200).json({ products: productsWithMarkets });
  } catch (error) {
    console.error("Error al obtener productos públicos:", error);
    return res.status(500).json({ message: "Error al obtener los productos" });
  }
}
