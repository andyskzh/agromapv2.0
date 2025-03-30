import { PrismaClient, Role } from "@prisma/client";
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
    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ message: "Usuario eliminado" });
  }

  if (req.method === "PATCH") {
    const { role } = req.body;
  
    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ message: "Rol inválido" });
    }
  
    await prisma.user.update({
      where: { id },
      data: { role },
    });
  
    return res.status(200).json({ message: "Rol actualizado" });
  }

  return res.status(405).json({ message: "Método no permitido" });
}
