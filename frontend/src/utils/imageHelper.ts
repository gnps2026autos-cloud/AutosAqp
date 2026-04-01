import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export const pickImage = async (): Promise<string | null> => {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se necesitan permisos para acceder a las fotos');
      return null;
    }

    // Pick image
    const result = await ImagePicker.launchImagePickerAsync({
      mediaTypes: 'images' as any,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6, // Reduce quality to keep base64 size manageable
    });

    if (result.canceled) {
      return null;
    }

    // Convert to base64
    const uri = result.assets[0].uri;
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Return with proper data URL format
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

export const formatPrice = (price: number): string => {
  return `S/ ${price.toLocaleString('es-PE')}`;
};

export const formatKm = (km: number): string => {
  return `${km.toLocaleString('es-PE')} km`;
};