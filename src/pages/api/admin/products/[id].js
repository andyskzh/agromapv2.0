import { PrismaClient, ProductCategory } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          market: {
            select: {
              id: true,
              name: true,
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

      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      return res.status(200).json({ product });
    } catch (error) {
      console.error("Error al obtener producto:", error);
      return res.status(500).json({ message: "Error al obtener producto" });
    }
  }

  if (req.method === "PUT") {
    try {
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
        marketId,
        baseProductId,
        image,
        type,
        nutrition,
      } = req.body;

      // Validar campos requeridos
      if (!name || !quantity || !marketId) {
        return res.status(400).json({
          message:
            "Faltan campos requeridos: nombre, cantidad y mercado son obligatorios",
        });
      }

      // Validar categoría si se proporciona
      if (category && !Object.values(ProductCategory).includes(category)) {
        return res.status(400).json({ message: "Categoría inválida" });
      }

      // Verificar si el mercado existe
      const market = await prisma.market.findUnique({
        where: { id: marketId },
      });

      if (!market) {
        return res.status(400).json({ message: "Mercado no encontrado" });
      }

      // Verificar si el producto base existe si se proporciona
      if (baseProductId) {
        const baseProduct = await prisma.productBase.findUnique({
          where: { id: baseProductId },
        });

        if (!baseProduct) {
          return res
            .status(400)
            .json({ message: "Producto base no encontrado" });
        }
      }

      // Crear objeto de datos para el producto
      const productData = {
        name,
        description: description || "",
        quantity: parseInt(quantity),
        unit: unit || "kg",
        price: price ? parseFloat(price) : null,
        priceType: priceType || "unidad",
        category: category || "OTRO",
        isAvailable: isAvailable === "true" || isAvailable === true,
        sasProgram: sasProgram === "true" || sasProgram === true,
        marketId,
        baseProductId: baseProductId || null,
        image: image || null,
        type: type || null,
        nutrition: nutrition || null,
      };

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: productData,
        include: {
          market: {
            select: {
              id: true,
              name: true,
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

      return res.status(200).json({ product: updatedProduct });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      return res.status(500).json({ message: "Error al actualizar producto" });
    }
  }

  if (req.method === "DELETE") {
    try {
      // Verificar si el producto tiene comentarios
      const productWithComments = await prisma.product.findUnique({
        where: { id },
        include: {
          comments: true,
        },
      });

      if (productWithComments.comments.length > 0) {
        return res.status(400).json({
          message: "No se puede eliminar un producto que tiene comentarios",
        });
      }

      await prisma.product.delete({ where: { id } });
      return res.status(200).json({ message: "Producto eliminado" });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      return res.status(500).json({ message: "Error al eliminar producto" });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
