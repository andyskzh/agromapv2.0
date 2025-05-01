import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    // Obtener todos los productos con sus mercados
    const products = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
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
            image: true,
            category: true,
          },
        },
      },
    });

    // Obtener todos los productos base
    const baseProducts = await prisma.productBase.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        category: true,
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

    // Crear un array con todos los productos, incluyendo los base sin productos asociados
    const allProducts = baseProducts.map((baseProduct) => {
      const associatedProducts = productsByBase[baseProduct.id] || [];
      const availableMarkets = associatedProducts.map((p) => ({
        id: p.market.id,
        name: p.market.name,
        location: p.market.location,
        productId: p.id,
      }));

      return {
        id: baseProduct.id,
        baseProductId: baseProduct.id,
        name: baseProduct.name,
        image: baseProduct.image,
        category: baseProduct.category,
        markets: availableMarkets,
        lastUpdated:
          associatedProducts.length > 0
            ? Math.max(
                ...associatedProducts.map((p) =>
                  new Date(p.updatedAt).getTime()
                )
              )
            : 0,
      };
    });

    // Ordenar productos por fecha de actualización
    allProducts.sort((a, b) => b.lastUpdated - a.lastUpdated);

    return res.status(200).json({ products: allProducts });
  } catch (error) {
    console.error("Error al obtener productos públicos:", error);
    return res.status(500).json({ message: "Error al obtener los productos" });
  }
}
