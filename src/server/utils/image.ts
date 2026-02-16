import sharp from 'sharp';

/**
 * Process avatar image: resize, convert to JPEG, return base64 data URL
 * 
 * Security features:
 * - Strips EXIF metadata
 * - Validates image can be processed by sharp (content validation)
 * - Standardizes format to JPEG
 * 
 * @param buffer - Image buffer from multer
 * @returns Base64 data URL string
 * @throws Error if image processing fails
 */
export async function processAvatar(buffer: Buffer): Promise<string> {
  try {
    // Process image with sharp - this also validates it's a real image
    const processedBuffer = await sharp(buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({
        quality: 80,
      })
      .toBuffer();

    // Convert to base64 data URL
    const base64 = processedBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    throw new Error('Failed to process image. Please ensure the file is a valid image.');
  }
}
