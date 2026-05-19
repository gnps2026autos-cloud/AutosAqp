import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export const pickImage = async (): Promise<string | null> => {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      console.warn('Permiso denegado para acceder a la galería');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
      base64: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];

    if (!asset.uri) {
      console.warn('No se pudo obtener la URI de la imagen');
      return null;
    }

    const manipulated = await ImageManipulator.manipulateAsync(
      asset.uri,
      [
        {
          resize: {
            width: 1000,
          },
        },
      ],
      {
        compress: 0.45,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: false,
      }
    );

    return manipulated.uri;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

export const formatPrice = (price?: number | string | null): string => {
  const numericPrice =
    typeof price === 'string' ? Number(price) : price ?? 0;

  if (!Number.isFinite(numericPrice)) {
    return 'S/ 0';
  }

  return `S/ ${numericPrice.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export const formatKm = (km?: number | string | null): string => {
  const numericKm =
    typeof km === 'string' ? Number(km) : km ?? 0;

  if (!Number.isFinite(numericKm)) {
    return '0 km';
  }

  return `${numericKm.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} km`;
};

export const formatDate = (date?: string | Date | null): string => {
  if (!date) {
    return 'Fecha no disponible';
  }

  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Fecha no disponible';
  }

  return parsedDate.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};