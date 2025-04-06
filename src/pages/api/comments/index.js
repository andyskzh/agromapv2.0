import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res
      .status(401)
      .json({ error: "Debes iniciar sesión para comentar" });
  }

  if (req.method === "POST") {
    try {
      const { productId, marketId, rating, content, recommends } = req.body;

      // Validar campos requeridos
      if (!productId || !marketId || !rating) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
      }

      // Validar rating
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ error: "La valoración debe estar entre 1 y 5" });
      }

      // Verificar que el producto existe
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          baseProduct: true,
        },
      });

      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      // Verificar que el mercado existe
      const market = await prisma.market.findUnique({
        where: { id: marketId },
      });

      if (!market) {
        return res.status(404).json({ error: "Mercado no encontrado" });
      }

      // Crear el comentario
      const comment = await prisma.comment.create({
        data: {
          content: content || "",
          rating,
          recommends: recommends ?? true,
          marketId,
          userId: session.user.id,
          productId,
        },
        include: {
          user: true,
          market: true,
        },
      });

      await prisma.$disconnect();
      return res.status(201).json(comment);
    } catch (error) {
      console.error("Error al crear el comentario:", error);
      res.status(500).json({ error: "Error al crear el comentario" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
