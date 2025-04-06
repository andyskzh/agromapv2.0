import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "No autorizado" });
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

      const comment = await prisma.comment.create({
        data: {
          content,
          rating,
          recommends,
          userId: session.user.id,
          productId,
          marketId,
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
