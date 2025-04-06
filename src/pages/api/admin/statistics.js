import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    // Obtener estadísticas de usuarios por rol
    const users = await prisma.user.findMany();
    const adminUsers = users.filter((user) => user.role === "ADMIN").length;
    const managerUsers = users.filter(
      (user) => user.role === "MARKET_MANAGER"
    ).length;
    const regularUsers = users.filter((user) => user.role === "USER").length;

    // Usuarios por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const usersByMonth = {};
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      usersByMonth[monthKey] = 0;
    }

    users.forEach((user) => {
      const userDate = new Date(user.createdAt);
      const monthKey = `${userDate.getFullYear()}-${String(
        userDate.getMonth() + 1
      ).padStart(2, "0")}`;
      if (usersByMonth[monthKey] !== undefined) {
        usersByMonth[monthKey]++;
      }
    });

    // Obtener estadísticas de productos por categoría
    const products = await prisma.product.findMany();
    const productsByCategory = {
      FRUTA: 0,
      HORTALIZA: 0,
      VIANDA: 0,
      CARNE_EMBUTIDO: 0,
      OTRO: 0,
    };

    products.forEach((product) => {
      productsByCategory[product.category]++;
    });

    const activeProducts = products.filter(
      (product) => product.isAvailable
    ).length;
    const sasProducts = products.filter((product) => product.sasProgram).length;

    // Productos por mes (últimos 6 meses)
    const productsByMonth = {};
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      productsByMonth[monthKey] = 0;
    }

    products.forEach((product) => {
      const productDate = new Date(product.createdAt);
      const monthKey = `${productDate.getFullYear()}-${String(
        productDate.getMonth() + 1
      ).padStart(2, "0")}`;
      if (productsByMonth[monthKey] !== undefined) {
        productsByMonth[monthKey]++;
      }
    });

    // Obtener estadísticas de mercados
    const markets = await prisma.market.findMany();

    // Mercados por mes (últimos 6 meses)
    const marketsByMonth = {};
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      marketsByMonth[monthKey] = 0;
    }

    markets.forEach((market) => {
      const marketDate = new Date(market.createdAt);
      const monthKey = `${marketDate.getFullYear()}-${String(
        marketDate.getMonth() + 1
      ).padStart(2, "0")}`;
      if (marketsByMonth[monthKey] !== undefined) {
        marketsByMonth[monthKey]++;
      }
    });

    // Obtener estadísticas de comentarios
    const comments = await prisma.comment.findMany();

    // Distribución de calificaciones
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    comments.forEach((comment) => {
      ratingDistribution[comment.rating]++;
    });

    // Comentarios por mes (últimos 6 meses)
    const commentsByMonth = {};
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      commentsByMonth[monthKey] = 0;
    }

    comments.forEach((comment) => {
      const commentDate = new Date(comment.createdAt);
      const monthKey = `${commentDate.getFullYear()}-${String(
        commentDate.getMonth() + 1
      ).padStart(2, "0")}`;
      if (commentsByMonth[monthKey] !== undefined) {
        commentsByMonth[monthKey]++;
      }
    });

    // Obtener estadísticas de productos base por categoría
    const baseProducts = await prisma.productBase.findMany();
    const baseProductsByCategory = {
      FRUTA: 0,
      HORTALIZA: 0,
      VIANDA: 0,
      CARNE_EMBUTIDO: 0,
      OTRO: 0,
    };

    baseProducts.forEach((product) => {
      baseProductsByCategory[product.category]++;
    });

    // Obtener productos más comentados
    const productsWithComments = await prisma.product.findMany({
      include: {
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        comments: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // Obtener productos mejor calificados
    const topRatedProducts = await prisma.product.findMany({
      include: {
        comments: true,
      },
    });

    const productsWithAverageRating = topRatedProducts
      .map((product) => {
        const avgRating =
          product.comments.length > 0
            ? product.comments.reduce(
                (sum, comment) => sum + comment.rating,
                0
              ) / product.comments.length
            : 0;
        return {
          id: product.id,
          name: product.name,
          averageRating: avgRating,
          commentCount: product.comments.length,
        };
      })
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);

    const statistics = {
      users: {
        total: users.length,
        byRole: {
          admin: adminUsers,
          manager: managerUsers,
          regular: regularUsers,
        },
        byMonth: Object.entries(usersByMonth).map(([month, count]) => ({
          month,
          count,
        })),
      },
      products: {
        total: products.length,
        active: activeProducts,
        inactive: products.length - activeProducts,
        sasProgram: sasProducts,
        byCategory: productsByCategory,
        byMonth: Object.entries(productsByMonth).map(([month, count]) => ({
          month,
          count,
        })),
        mostCommented: productsWithComments.map((product) => ({
          id: product.id,
          name: product.name,
          commentCount: product._count.comments,
        })),
        topRated: productsWithAverageRating,
      },
      markets: {
        total: markets.length,
        byMonth: Object.entries(marketsByMonth).map(([month, count]) => ({
          month,
          count,
        })),
      },
      comments: {
        total: comments.length,
        averageRating:
          comments.length > 0
            ? (
                comments.reduce((sum, comment) => sum + comment.rating, 0) /
                comments.length
              ).toFixed(1)
            : 0,
        ratingDistribution,
        byMonth: Object.entries(commentsByMonth).map(([month, count]) => ({
          month,
          count,
        })),
      },
      baseProducts: {
        total: baseProducts.length,
        byCategory: baseProductsByCategory,
      },
    };

    res.status(200).json(statistics);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
}
