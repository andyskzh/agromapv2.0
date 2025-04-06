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
        category,
        isAvailable,
        sasProgram,
        marketId,
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

      const product = await prisma.product.create({
        data: {
          name,
          description: description || "",
          quantity: parseInt(quantity),
          category: category || "OTRO",
          isAvailable: isAvailable === "true" || isAvailable === true,
          sasProgram: sasProgram === "true" || sasProgram === true,
          marketId,
        },
        include: {
          market: {
            select: {
              id: true,
              name: true,
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
