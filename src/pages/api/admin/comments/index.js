import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const comments = await prisma.comment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    res.status(500).json({ message: "Error al obtener comentarios" });
  }
}
