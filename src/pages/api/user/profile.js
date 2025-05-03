import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "No autorizado" });
  }

  // Obtener perfil
  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      return res.status(500).json({ message: "Error al obtener perfil" });
    }
  }

  // Actualizar perfil
  if (req.method === "PUT") {
    try {
      const { name, username, password, image } = req.body;

      // Verificar si el username ya existe en otro usuario
      if (username && username !== session.user.username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            username,
            NOT: {
              id: session.user.id,
            },
          },
        });

        if (existingUser) {
          return res.status(400).json({
            message: "El nombre de usuario ya está en uso",
          });
        }
      }

      // Preparar los datos a actualizar
      const updateData = {};

      if (name) updateData.name = name;
      if (username) updateData.username = username;
      if (image !== undefined) updateData.image = image || null; // Permitir establecer null explícitamente

      // Solo actualizar la contraseña si se proporciona una nueva
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      });

      return res.status(200).json({
        user: updatedUser,
        message: "Perfil actualizado correctamente",
      });
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      return res.status(500).json({ message: "Error al actualizar perfil" });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
