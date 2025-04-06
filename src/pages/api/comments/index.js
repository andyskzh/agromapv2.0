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

      // Validaciones
      if (!productId || !marketId || !rating || !content) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
      }

      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ error: "La valoración debe estar entre 1 y 5" });
      }

      // Verificar que el producto existe
      const product = await prisma.product.findUnique({
        where: { id: productId },
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

      const comment = await prisma.comment.create({
        data: {
          content,
          rating,
          recommends: recommends || true,
          userId: session.user.id,
          productId,
          marketId,
          likes: 0,
          dislikes: 0,
        },
        include: {
          user: true,
          market: true,
        },
      });

      res.status(201).json(comment);
    } catch (error) {
      console.error("Error al crear el comentario:", error);
      res.status(500).json({ error: "Error al crear el comentario" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
