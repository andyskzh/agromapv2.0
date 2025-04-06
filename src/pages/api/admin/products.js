import { PrismaClient, ProductCategory } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method === "GET") {
    try {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
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

      return res.status(200).json({ products });
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return res.status(500).json({ message: "Error al obtener productos" });
    }
  }

  if (req.method === "POST") {
    try {
      // Verificar si es FormData o JSON
      let data;
      if (req.headers["content-type"]?.includes("multipart/form-data")) {
        // Procesar FormData
        data = {};
        for (const [key, value] of Object.entries(req.body)) {
          if (key === "images") {
            // Manejar imágenes si es necesario
            continue;
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
        marketId,
        baseProductId,
        image,
      } = data;

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
      };

      const product = await prisma.product.create({
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

      return res.status(201).json({ product });
    } catch (error) {
      console.error("Error al crear producto:", error);
      return res.status(500).json({ message: "Error al crear producto" });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
