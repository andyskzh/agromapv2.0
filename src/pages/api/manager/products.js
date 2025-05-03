import { PrismaClient, ProductCategory } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method === "GET") {
    try {
      // Obtener el mercado del gestor
      const market = await prisma.market.findFirst({
        where: { managerId: session.user.id },
        select: { id: true },
      });

      if (!market) {
        return res
          .status(404)
          .json({ message: "No se encontró un mercado asociado a tu cuenta" });
      }

      // Obtener los productos del mercado del gestor
      const products = await prisma.product.findMany({
        where: { marketId: market.id },
        orderBy: { createdAt: "desc" },
        include: {
          baseProduct: {
            select: {
              id: true,
              name: true,
              image: true,
              category: true,
            },
          },
          comments: {
            select: {
              rating: true,
            },
          },
        },
      });

      // Obtener todas las categorías disponibles
      const categories = await prisma.productBase.findMany({
        select: {
          category: true,
        },
        distinct: ["category"],
      });

      // Calcular el promedio de valoraciones para cada producto
      const productsWithRatings = products.map((product) => {
        const totalRating = product.comments.reduce(
          (acc, comment) => acc + comment.rating,
          0
        );
        const averageRating =
          product.comments.length > 0
            ? totalRating / product.comments.length
            : 0;

        return {
          ...product,
          category: product.baseProduct?.category || product.category || "OTRO",
          averageRating: averageRating,
          totalComments: product.comments.length,
          comments: product.comments, // Mantener los comentarios para debug
        };
      });

      console.log("Productos con valoraciones:", productsWithRatings); // Debug

      return res.status(200).json({
        products: productsWithRatings,
        categories: categories.map((c) => c.category),
      });
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return res.status(500).json({ message: "Error al obtener productos" });
    }
  }

  if (req.method === "POST") {
    try {
      // Obtener el mercado del gestor
      const market = await prisma.market.findFirst({
        where: { managerId: session.user.id },
        select: { id: true },
      });

      if (!market) {
        return res
          .status(404)
          .json({ message: "No se encontró un mercado asociado a tu cuenta" });
      }

      // Verificar si es FormData o JSON
      let data;
      if (req.headers["content-type"]?.includes("multipart/form-data")) {
        // Procesar FormData
        data = {};
        for (const [key, value] of Object.entries(req.body)) {
          if (key === "images") {
            data[key] = Array.isArray(value) ? value : [];
          } else if (key === "isAvailable" || key === "sasProgram") {
            data[key] = value === "true" || value === true;
          } else if (key === "quantity") {
            data[key] = parseInt(value);
          } else if (key === "price") {
            data[key] = value ? parseFloat(value) : null;
          } else {
            data[key] = value;
          }
        }
      } else {
        // Procesar JSON
        data = req.body;
      }

      const {
        name,
        description,
        quantity,
        unit,
        price,
        priceType,
        category,
        isAvailable,
        sasProgram,
        baseProductId,
        image,
        images = [],
      } = data;

      // Validar campos requeridos
      if (!name || !quantity) {
        return res.status(400).json({
          message:
            "Faltan campos requeridos: nombre y cantidad son obligatorios",
        });
      }

      // Validar categoría si se proporciona
      if (category && !Object.values(ProductCategory).includes(category)) {
        return res.status(400).json({ message: "Categoría inválida" });
      }

      // Crear el producto
      const product = await prisma.product.create({
        data: {
          name,
          description,
          quantity: parseInt(quantity),
          unit,
          price: price ? parseFloat(price) : null,
          priceType,
          category,
          isAvailable,
          sasProgram,
          marketId: market.id, // Usar el ID del mercado del gestor
          baseProductId: baseProductId || null,
          image: image || null,
          images: images || [],
        },
      });

      return res.status(201).json(product);
    } catch (error) {
      console.error("Error al crear producto:", error);
      return res.status(500).json({
        message: "Error al crear el producto",
        error: error.message,
      });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
