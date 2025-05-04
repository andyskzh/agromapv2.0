const { name, location, description, latitude, longitude, legalBeneficiary } =
  fields;

if (!name || !location || !latitude || !longitude) {
  return res.status(400).json({
    message: "Nombre, ubicación y coordenadas son requeridos",
  });
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
    managerId: session.user.id,
    image: imageUrl,
    legalBeneficiary: legalBeneficiary?.toString() || null,
  },
});

return res.status(201).json({
  message: "Mercado creado correctamente",
  market: market,
});
