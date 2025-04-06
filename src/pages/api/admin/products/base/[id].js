import { PrismaClient, ProductCategory } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const baseProduct = await prisma.productBase.findUnique({
        where: { id },
      });

      if (!baseProduct) {
        return res.status(404).json({ message: "Producto base no encontrado" });
      }

      return res.status(200).json({ baseProduct });
    } catch (error) {
      console.error("Error al obtener producto base:", error);
      return res
        .status(500)
        .json({ message: "Error al obtener producto base" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { name, image, category, nutrition } = req.body;

      // Verificar si el producto base existe
      const existingBaseProduct = await prisma.productBase.findUnique({
        where: { id },
      });

      if (!existingBaseProduct) {
        return res.status(404).json({ message: "Producto base no encontrado" });
      }

      // Validar campos requeridos
      if (!name || !category) {
        return res.status(400).json({
          message:
            "Faltan campos requeridos: nombre y categoría son obligatorios",
        });
      }

      // Validar categoría
      if (!Object.values(ProductCategory).includes(category)) {
        return res.status(400).json({ message: "Categoría inválida" });
      }

      // Actualizar producto base
      const updatedBaseProduct = await prisma.productBase.update({
        where: { id },
        data: {
          name,
          image: image || existingBaseProduct.image,
          category,
          nutrition: nutrition || "",
        },
      });

      return res.status(200).json({ baseProduct: updatedBaseProduct });
    } catch (error) {
      console.error("Error al actualizar producto base:", error);
      return res
        .status(500)
        .json({ message: "Error al actualizar producto base" });
    }
  }

  if (req.method === "DELETE") {
    try {
      // Verificar si el producto base tiene productos asociados
      const baseProductWithProducts = await prisma.productBase.findUnique({
        where: { id },
        include: {
          products: true,
        },
      });

      if (!baseProductWithProducts) {
        return res.status(404).json({ message: "Producto base no encontrado" });
      }

      if (baseProductWithProducts.products.length > 0) {
        return res.status(400).json({
          message:
            "No se puede eliminar un producto base que tiene productos asociados",
        });
      }

      await prisma.productBase.delete({ where: { id } });
      return res.status(200).json({ message: "Producto base eliminado" });
    } catch (error) {
      console.error("Error al eliminar producto base:", error);
      return res
        .status(500)
        .json({ message: "Error al eliminar producto base" });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
