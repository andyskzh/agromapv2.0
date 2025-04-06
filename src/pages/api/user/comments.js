import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "No autorizado" });
  }

  // Obtener comentarios del usuario
  if (req.method === "GET") {
    try {
      const comments = await prisma.comment.findMany({
        where: { userId: session.user.id },
        include: {
          product: true,
          market: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ comments });
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
      return res.status(500).json({ message: "Error al obtener comentarios" });
    }
  }

  // Eliminar un comentario
  if (req.method === "DELETE") {
    try {
      const { commentId } = req.body;

      if (!commentId) {
        return res.status(400).json({ message: "ID de comentario requerido" });
      }

      // Verificar que el comentario pertenece al usuario
      const comment = await prisma.comment.findFirst({
        where: {
          id: commentId,
          userId: session.user.id,
        },
      });

      if (!comment) {
        return res.status(404).json({
          message:
            "Comentario no encontrado o no tienes permiso para eliminarlo",
        });
      }

      // Eliminar el comentario
      await prisma.comment.delete({
        where: { id: commentId },
      });

      return res.status(200).json({
        message: "Comentario eliminado correctamente",
      });
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      return res.status(500).json({ message: "Error al eliminar comentario" });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
