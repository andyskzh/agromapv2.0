import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
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

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method === "GET") {
    try {
      const markets = await prisma.market.findMany({
        orderBy: { name: "asc" },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          products: {
            select: {
              id: true,
            },
          },
        },
      });

      res.status(200).json({ markets });
    } catch (error) {
      console.error("Error al obtener mercados:", error);
      res.status(500).json({ message: "Error al obtener mercados" });
    }
  } else if (req.method === "POST") {
    try {
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

        const {
          name,
          location,
          description,
          managerId,
          latitude,
          longitude,
          legalBeneficiary,
        } = fields;

        if (!name || !location || !latitude || !longitude) {
          return res.status(400).json({
            message: "Nombre, ubicación y coordenadas son requeridos",
          });
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

        let imageUrl = null;
        const imageFile = files.image?.[0];

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
            latitude: parseFloat(latitude.toString()),
            longitude: parseFloat(longitude.toString()),
            managerId: managerId && managerId.length > 0 ? managerId[0] : null,
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

        return res.status(201).json({
          message: "Mercado creado correctamente",
          market: market,
        });
      });
    } catch (error) {
      console.error("Error al crear mercado:", error);
      res.status(500).json({ message: "Error al crear mercado" });
    }
  } else {
    res.status(405).json({ message: "Método no permitido" });
  }
}
