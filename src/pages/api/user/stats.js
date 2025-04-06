import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    // Obtener el usuario con sus relaciones
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        comments: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            product: true,
            market: true,
          },
        },
        markets: true,
      },
    });

    // Preparar la actividad reciente
    const recentActivity = user.comments.map((comment) => ({
      type: "comment",
      title: `Comentario en ${comment.product.name}`,
      description: comment.content,
      date: comment.createdAt,
    }));

    // Ordenar actividad por fecha
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json({
      totalComments: user.comments.length,
      totalMarkets: user.markets.length,
      recentActivity: recentActivity.slice(0, 5), // Últimas 5 actividades
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return res.status(500).json({ message: "Error al obtener estadísticas" });
  }
}
