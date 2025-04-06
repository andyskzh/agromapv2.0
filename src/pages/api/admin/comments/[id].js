import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { id } = req.query;

  try {
    await prisma.comment.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.status(200).json({ message: "Comentario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    res.status(500).json({ message: "Error al eliminar comentario" });
  }
}
