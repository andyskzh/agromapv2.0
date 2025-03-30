import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { name, username, password, image } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    return res
      .status(409)
      .json({ message: "El nombre de usuario ya está en uso" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      username,
      password: hashedPassword,
      image: image || null,
    },
  });

  return res.status(201).json({
    message: "Usuario creado exitosamente",
    user: { id: user.id, username: user.username },
  });
}
