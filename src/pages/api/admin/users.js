import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method === "GET") {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, username: true, role: true },
      orderBy: { name: "asc" },
    });
    return res.status(200).json({ users });
  }

  if (req.method === "POST") {
    const { name, username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role: role || "USER",
      },
    });
    return res.status(201).json({ user });
  }

  return res.status(405).json({ message: "Método no permitido" });
}
