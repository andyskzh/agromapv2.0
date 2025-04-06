import { PrismaClient, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return res.status(500).json({ message: "Error al obtener usuario" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { name, username, password, role } = req.body;

      if (!username || !role) {
        return res.status(400).json({
          message: "El nombre de usuario y el rol son campos requeridos",
        });
      }

      if (!Object.values(Role).includes(role)) {
        return res.status(400).json({ message: "Rol inválido" });
      }

      // Verificar si el username ya existe en otro usuario
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: {
            id,
          },
        },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "El nombre de usuario ya está en uso",
        });
      }

      // Preparar los datos a actualizar
      const updateData = {
        name,
        username,
        role,
      };

      // Solo actualizar la contraseña si se proporciona una nueva
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
        },
      });

      return res.status(200).json({ user: updatedUser });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return res.status(500).json({ message: "Error al actualizar usuario" });
    }
  }

  if (req.method === "DELETE") {
    try {
      // Verificar si el usuario tiene mercados asociados
      const userWithMarkets = await prisma.user.findUnique({
        where: { id },
        include: {
          markets: true,
        },
      });

      if (userWithMarkets.markets.length > 0) {
        return res.status(400).json({
          message:
            "No se puede eliminar un usuario que tiene mercados asociados",
        });
      }

      await prisma.user.delete({ where: { id } });
      return res.status(200).json({ message: "Usuario eliminado" });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      return res.status(500).json({ message: "Error al eliminar usuario" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { role } = req.body;

      if (!Object.values(Role).includes(role)) {
        return res.status(400).json({ message: "Rol inválido" });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
        },
      });

      return res.status(200).json({ user: updatedUser });
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      return res.status(500).json({ message: "Error al actualizar rol" });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
