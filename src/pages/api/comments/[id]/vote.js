import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { id } = req.query;
  const { type } = req.body;

  if (!id || !type || !["like", "dislike"].includes(type)) {
    return res.status(400).json({ error: "Parámetros inválidos" });
  }

  try {
    // Verificar si el comentario existe
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    // Actualizar el comentario
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        [type === "like" ? "likes" : "dislikes"]: {
          increment: 1,
        },
      },
    });

    await prisma.$disconnect();
    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error al votar el comentario:", error);
    await prisma.$disconnect();
    return res.status(500).json({ error: "Error al procesar el voto" });
  }
}
