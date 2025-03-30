import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method === "DELETE") {
    try {
      await prisma.market.delete({
        where: { id },
      });
      return res.status(200).json({ message: "Mercado eliminado" });
    } catch (error) {
      console.error("Error al eliminar mercado:", error);
      return res.status(500).json({ message: "Error al eliminar mercado" });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
