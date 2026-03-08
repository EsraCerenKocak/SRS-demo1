import * as ImageManipulator from 'expo-image-manipulator';

export const optimizeImage = async (uri: string): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], // Re-sizing width, height auto calculates based on aspect ratio
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress Quality 0.7
    );

    return result.uri;
  } catch (error) {
    console.error('Image optimization failed:', error);
    // Geri dönüş olarak orijinal uri gönderiyoruz, hata alsa bile uygulama çökmesin.
    return uri;
  }
};
