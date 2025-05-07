import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  switch (req.method) {
    case "GET":
      try {
        const market = await prisma.market.findUnique({
          where: { id },
          include: {
            manager: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
            schedules: true,
          },
        });

        if (!market) {
          return res.status(404).json({ message: "Mercado no encontrado" });
        }

        return res.status(200).json({ market });
      } catch (error) {
        console.error("Error al obtener mercado:", error);
        return res.status(500).json({ message: "Error al obtener mercado" });
      }

    case "PUT":
      try {
        const form = formidable({
          keepExtensions: true,
          maxFileSize: 5 * 1024 * 1024, // 5MB
        });

        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error("Error al parsear el formulario:", err);
            return res.status(500).json({
              message: "Error al procesar el formulario",
              details: err.message,
            });
          }

          const {
            name,
            location,
            description,
            managerId,
            latitude,
            longitude,
            legalBeneficiary,
            schedule,
          } = fields;

          if (!name || !location || !latitude || !longitude) {
            return res.status(400).json({
              message: "Nombre, ubicación y coordenadas son requeridos",
            });
          }

          // Verificar que el mercado existe
          const existingMarket = await prisma.market.findUnique({
            where: { id },
          });

          if (!existingMarket) {
            return res.status(404).json({ message: "Mercado no encontrado" });
          }

          // Si se proporciona un managerId, verificar que el usuario existe y es un MARKET_MANAGER
          if (managerId && managerId.length > 0) {
            const manager = await prisma.user.findUnique({
              where: { id: managerId[0] },
            });

            if (!manager || manager.role !== "MARKET_MANAGER") {
              return res.status(400).json({
                message: "El gestor seleccionado no es válido",
              });
            }
          }

          let imageUrl = existingMarket.image; // Mantener la imagen actual por defecto
          const imageFile = files.image?.[0];

          // Si hay una nueva imagen, subirla a Cloudinary
          if (imageFile) {
            const result = await cloudinary.uploader.upload(
              imageFile.filepath,
              {
                folder: "agromap/mercados",
              }
            );
            imageUrl = result.secure_url;
          }

          const market = await prisma.market.update({
            where: { id },
            data: {
              name: name.toString(),
              location: location.toString(),
              description: description?.toString(),
              latitude: parseFloat(latitude.toString()),
              longitude: parseFloat(longitude.toString()),
              managerId:
                managerId && managerId.length > 0 ? managerId[0] : null,
              image: imageUrl,
              legalBeneficiary: legalBeneficiary?.toString() || null,
            },
            include: {
              manager: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            },
          });

          // Actualizar los horarios
          if (schedule) {
            const parsedSchedule = JSON.parse(schedule.toString());

            // Eliminar horarios existentes
            await prisma.marketSchedule.deleteMany({
              where: { marketId: id },
            });

            // Crear el horario base
            await prisma.marketSchedule.create({
              data: {
                marketId: id,
                openTime: parsedSchedule.openTime,
                closeTime: parsedSchedule.closeTime,
                days: parsedSchedule.days,
                isException: false,
              },
            });

            // Crear las excepciones si existen
            if (
              parsedSchedule.exceptions &&
              parsedSchedule.exceptions.length > 0
            ) {
              await Promise.all(
                parsedSchedule.exceptions.map((exception) =>
                  prisma.marketSchedule.create({
                    data: {
                      marketId: id,
                      day: exception.day,
                      openTime: exception.openTime,
                      closeTime: exception.closeTime,
                      isException: true,
                    },
                  })
                )
              );
            }
          }

          return res.status(200).json({
            message: "Mercado actualizado correctamente",
            market: market,
          });
        });
      } catch (error) {
        console.error("Error al actualizar mercado:", error);
        return res.status(500).json({ message: "Error al actualizar mercado" });
      }
      break;

    case "DELETE":
      try {
        // Obtener información del mercado antes de eliminarlo
        const market = await prisma.market.findUnique({
          where: { id },
          include: {
            products: {
              include: {
                comments: true,
              },
            },
          },
        });

        if (!market) {
          return res.status(404).json({ message: "Mercado no encontrado" });
        }

        // Eliminar todos los comentarios asociados a los productos del mercado
        for (const product of market.products) {
          await prisma.comment.deleteMany({
            where: { productId: product.id },
          });
        }

        // Eliminar todos los productos del mercado
        await prisma.product.deleteMany({
          where: { marketId: id },
        });

        // Eliminar los horarios del mercado
        await prisma.marketSchedule.deleteMany({
          where: { marketId: id },
        });

        // Finalmente, eliminar el mercado
        await prisma.market.delete({
          where: { id },
        });

        return res.status(200).json({
          message: "Mercado eliminado correctamente",
          deletedItems: {
            products: market.products.length,
            comments: market.products.reduce(
              (acc, product) => acc + product.comments.length,
              0
            ),
          },
        });
      } catch (error) {
        console.error("Error al eliminar mercado:", error);
        return res.status(500).json({ message: "Error al eliminar mercado" });
      }

    default:
      return res.status(405).json({ message: "Método no permitido" });
  }
}
