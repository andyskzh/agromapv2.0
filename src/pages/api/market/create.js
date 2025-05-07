import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
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
  try {
    const session = await getServerSession(req, res, authOptions);

    console.log("Sesión del servidor:", {
      exists: !!session,
      user: session?.user,
      role: session?.user?.role,
    });

    // Verificar método
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Método no permitido",
        details: `Método ${req.method} no soportado`,
      });
    }

    // Verificar autenticación
    if (!session) {
      return res.status(401).json({
        message: "No autorizado",
        details: "No hay sesión activa",
      });
    }

    // Verificar rol
    if (session.user.role !== "MARKET_MANAGER") {
      return res.status(401).json({
        message: "No autorizado",
        details: `Rol ${session.user.role} no tiene permisos`,
      });
    }

    // Verificar que no tenga ya un mercado
    const existing = await prisma.market.findFirst({
      where: { managerId: session.user.id },
    });

    if (existing) {
      return res.status(400).json({
        message: "Ya tienes un mercado registrado",
        market: existing,
      });
    }

    // Configurar formidable
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    // Parsear el formulario
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error al parsear el formulario:", err);
        return res.status(500).json({
          message: "Error al procesar el formulario",
          details: err.message,
        });
      }

      const { name, location, description, legalBeneficiary, schedule } =
        fields;
      const imageFile = files.image?.[0];

      if (!name || !location) {
        return res.status(400).json({
          message: "Datos inválidos",
          details: "Nombre y ubicación son obligatorios",
        });
      }

      // Verificar que se proporcionen las coordenadas
      if (!fields.latitude || !fields.longitude) {
        return res.status(400).json({
          message: "Datos inválidos",
          details: "Latitud y longitud son obligatorios",
        });
      }

      try {
        let imageUrl = null;

        // Si hay una imagen, subirla a Cloudinary
        if (imageFile) {
          const result = await cloudinary.uploader.upload(imageFile.filepath, {
            folder: "agromap/mercados",
          });
          imageUrl = result.secure_url;
        }

        // Crear el mercado
        const market = await prisma.market.create({
          data: {
            name: name.toString(),
            location: location.toString(),
            description: description?.toString(),
            latitude: parseFloat(fields.latitude.toString()),
            longitude: parseFloat(fields.longitude.toString()),
            image: imageUrl,
            manager: { connect: { id: session.user.id } },
            legalBeneficiary: legalBeneficiary?.toString() || null,
          },
        });

        // Crear los horarios si existen
        if (schedule) {
          const parsedSchedule = JSON.parse(schedule.toString());

          // Crear el horario base
          await prisma.marketSchedule.create({
            data: {
              marketId: market.id,
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
                    marketId: market.id,
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

        return res.status(201).json({
          message: "Mercado creado exitosamente",
          market,
        });
      } catch (error) {
        console.error("Error al crear el mercado:", error);
        return res.status(500).json({
          message: "Error al crear el mercado",
          details: error.message,
        });
      }
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({
      message: "Error en el servidor",
      details: error.message,
    });
  }
}
