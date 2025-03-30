import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    console.log("Sesión del servidor:", {
      exists: !!session,
      user: session?.user,
      role: session?.user?.role
    });

    // Verificar método
    if (req.method !== "POST") {
      return res.status(405).json({ 
        message: "Método no permitido",
        details: `Método ${req.method} no soportado`
      });
    }

    // Verificar autenticación
    if (!session) {
      return res.status(401).json({ 
        message: "No autorizado",
        details: "No hay sesión activa"
      });
    }

    // Verificar rol
    if (session.user.role !== "MARKET_MANAGER") {
      return res.status(401).json({ 
        message: "No autorizado",
        details: `Rol ${session.user.role} no tiene permisos`
      });
    }

    const { name, location, description } = req.body;

    if (!name || !location) {
      return res.status(400).json({ 
        message: "Datos inválidos",
        details: "Nombre y ubicación son obligatorios" 
      });
    }

    // Verificar que no tenga ya un mercado
    const existing = await prisma.market.findFirst({
      where: { managerId: session.user.id },
    });

    if (existing) {
      return res.status(400).json({ 
        message: "Ya tienes un mercado registrado",
        market: existing
      });
    }

    const market = await prisma.market.create({
      data: {
        name,
        location,
        description,
        manager: { connect: { id: session.user.id } },
      },
    });

    return res.status(201).json({ 
      message: "Mercado creado exitosamente",
      market 
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      details: error.message 
    });
  }
}
