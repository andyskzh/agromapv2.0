import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { id } = req.query;
  const { type } = req.body;

  if (req.method === "POST") {
    try {
      if (!["like", "dislike"].includes(type)) {
        return res.status(400).json({ error: "Tipo de voto inválido" });
      }

      const comment = await prisma.comment.findUnique({
        where: { id },
      });

      if (!comment) {
        return res.status(404).json({ error: "Comentario no encontrado" });
      }

      const updatedComment = await prisma.comment.update({
        where: { id },
        data: {
          likes: type === "like" ? comment.likes + 1 : comment.likes,
          dislikes:
            type === "dislike" ? comment.dislikes + 1 : comment.dislikes,
        },
      });

      res.status(200).json(updatedComment);
    } catch (error) {
      console.error("Error al votar el comentario:", error);
      res.status(500).json({ error: "Error al votar el comentario" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
