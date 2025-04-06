import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "MARKET_MANAGER") {
    return res.status(401).json({ message: "No autorizado" });
  }

  const { id } = req.query;

  try {
    // Obtener el mercado del gestor
    const market = await prisma.market.findFirst({
      where: { managerId: session.user.id },
    });

    if (!market) {
      return res
        .status(404)
        .json({ message: "No tienes un mercado registrado" });
    }

    if (req.method === "GET") {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          market: true,
          comments: {
            include: {
              user: true,
            },
          },
          baseProduct: true,
        },
      });

      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      // Calcular el promedio de valoraciones
      const ratings = product.comments.map((comment) => comment.rating);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

      // Calcular la distribución de valoraciones
      const distribution = [5, 4, 3, 2, 1].map((stars) => {
        const count = ratings.filter((r) => r === stars).length;
        const percentage =
          ratings.length > 0 ? (count / ratings.length) * 100 : 0;
        return { estrellas: stars, porcentaje: Math.round(percentage) };
      });

      const formattedProduct = {
        ...product,
        valoraciones: {
          promedio: Number(averageRating.toFixed(1)),
          total: ratings.length,
          distribucion: distribution,
        },
      };

      return res.status(200).json(formattedProduct);
    }

    if (req.method === "PUT") {
      const { name, description, quantity, image } = req.body;

      if (!name || !quantity || quantity < 1) {
        return res
          .status(400)
          .json({ message: "Nombre y cantidad válida son obligatorios" });
      }

      const updated = await prisma.product.updateMany({
        where: { id, marketId: market.id },
        data: {
          name,
          description,
          quantity,
          image,
        },
      });

      if (updated.count === 0) {
        return res
          .status(404)
          .json({ message: "No se pudo actualizar el producto" });
      }

      return res
        .status(200)
        .json({ message: "Producto actualizado correctamente" });
    }

    if (req.method === "DELETE") {
      const deleted = await prisma.product.deleteMany({
        where: { id, marketId: market.id },
      });

      if (deleted.count === 0) {
        return res
          .status(404)
          .json({ message: "Producto no encontrado o no autorizado" });
      }

      return res.status(200).json({ message: "Producto eliminado" });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    return res.status(500).json({ error: "Error al obtener el producto" });
  }
}
