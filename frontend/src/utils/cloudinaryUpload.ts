const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
  if (!imageUri) {
    throw new Error('No se recibió una imagen válida');
  }

  if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
    return imageUri;
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary no está configurado en el frontend');
  }

  const formData = new FormData();

  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: `vehicle_${Date.now()}.jpg`,
  } as any);

  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error('Cloudinary upload error:', data);
    throw new Error(data?.error?.message || 'No se pudo subir la imagen a Cloudinary');
  }

  if (!data.secure_url) {
    throw new Error('Cloudinary no devolvió una URL segura');
  }

  return data.secure_url;
};

export const uploadVehicleImagesToCloudinary = async <T extends Record<string, any>>(
  vehicleData: T
): Promise<T> => {
  const requiredImageFields = [
    'foto_frente',
    'foto_atras',
    'foto_costado_izq',
    'foto_costado_der',
    'foto_interior',
  ];

  const updatedData: Record<string, any> = { ...vehicleData };

  for (const field of requiredImageFields) {
    if (updatedData[field]) {
      updatedData[field] = await uploadImageToCloudinary(updatedData[field]);
    }
  }

  if (Array.isArray(updatedData.galeria_fotos)) {
    updatedData.galeria_fotos = await Promise.all(
      updatedData.galeria_fotos
        .filter((image: string) => Boolean(image))
        .map((image: string) => uploadImageToCloudinary(image))
    );
  }

  return updatedData as T;
};