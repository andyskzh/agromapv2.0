import { getSession } from "next-auth/react";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const session = await getSession({ req });
  if (!session || session.user.role !== "MARKET_MANAGER") {
    return res.status(401).json({ message: "No autorizado" });
  }

  const { marketId } = req.query;

  if (!marketId) {
    return res.status(400).json({ message: "Se requiere el ID del mercado" });
  }

  try {
    // Obtener productos y comentarios
    const products = await prisma.Product.findMany({
      where: {
        marketId: marketId,
      },
      include: {
        comments: {
          include: {
            user: {
              select: {
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    // Calcular estadísticas básicas
    const totalProducts = products.length;
    const availableProducts = products.filter((p) => p.isAvailable).length;
    const unavailableProducts = totalProducts - availableProducts;

    // Calcular productos mejor valorados
    const topRatedProducts = products
      .map((product) => ({
        ...product,
        averageRating:
          product.comments.length > 0
            ? product.comments.reduce(
                (acc, comment) => acc + comment.rating,
                0
              ) / product.comments.length
            : 0,
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);

    // Calcular productos más comentados
    const mostCommentedProducts = products
      .sort((a, b) => b.comments.length - a.comments.length)
      .slice(0, 5);

    // Obtener comentarios recientes
    const recentComments = products
      .flatMap((product) =>
        product.comments.map((comment) => ({
          productName: product.name,
          ...comment,
        }))
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Calcular métricas de rendimiento
    const totalComments = products.reduce(
      (acc, product) => acc + product.comments.length,
      0
    );
    const averageRating =
      products.reduce((acc, product) => {
        const productRating =
          product.comments.length > 0
            ? product.comments.reduce(
                (sum, comment) => sum + comment.rating,
                0
              ) / product.comments.length
            : 0;
        return acc + productRating;
      }, 0) / (products.length || 1);

    // Obtener actividad reciente
    const recentActivity = products
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map((product) => ({
        type:
          new Date(product.updatedAt) > new Date(product.createdAt)
            ? "update"
            : "create",
        message: `${product.name} ${
          new Date(product.updatedAt) > new Date(product.createdAt)
            ? "actualizado"
            : "creado"
        }`,
        timestamp: product.updatedAt,
      }));

    return res.status(200).json({
      totalProducts,
      availableProducts,
      unavailableProducts,
      totalComments,
      averageRating: parseFloat(averageRating.toFixed(1)),
      recentActivity,
      topRatedProducts: topRatedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        image: product.image,
        averageRating: parseFloat(product.averageRating.toFixed(1)),
        totalComments: product.comments.length,
      })),
      mostCommentedProducts: mostCommentedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        image: product.image,
        totalComments: product.comments.length,
      })),
      recentComments: recentComments.map((comment) => ({
        id: comment.id,
        productName: comment.productName,
        content: comment.content,
        rating: comment.rating,
        userName: comment.user.name || comment.user.username,
        timestamp: comment.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return res.status(500).json({ message: "Error al obtener estadísticas" });
  }
}
