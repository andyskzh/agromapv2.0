import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const { id } = req.query;

    if (!session || session.user.role !== "ADMIN") {
      return res.status(401).json({ error: "No autorizado" });
    }

    if (req.method !== "DELETE") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    if (!id) {
      return res
        .status(400)
        .json({ error: "ID de comentario no proporcionado" });
    }

    // Verificar si el comentario existe antes de intentar eliminarlo
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    // Eliminar el comentario
    await prisma.comment.delete({
      where: { id },
    });

    res.status(200).json({ message: "Comentario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    res.status(500).json({ error: "Error al eliminar comentario" });
  } finally {
    await prisma.$disconnect();
  }
}
