import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Decodes a base64 image data URL and saves it to standard local disk.
 * Supports JPG, JPEG, PNG, WEBP.
 * @param {string} base64Str - The data URL image string
 * @returns {string} - The public static URL path (e.g. '/uploads/image.png') or empty string if failed.
 */
export const saveBase64Image = (base64Str) => {
  if (!base64Str) return '';
  
  // If it's already a saved static upload URL, return it directly
  if (base64Str.startsWith('/uploads/')) {
    return base64Str;
  }
  
  // If it's a dynamic external photo or web preset that is already a valid URL, return it
  if (base64Str.startsWith('http://') || base64Str.startsWith('https://')) {
    return base64Str;
  }

  // Verify that it is a base64 Data URL
  if (!base64Str.startsWith('data:image')) {
    return '';
  }

  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Malformed base64 image payload');
    }

    const format = matches[1];
    const rawData = matches[2];
    const buffer = Buffer.from(rawData, 'base64');

    // Extract file extension
    let extension = 'jpg';
    if (format.includes('png')) {
      extension = 'png';
    } else if (format.includes('webp')) {
      extension = 'webp';
    } else if (format.includes('jpeg') || format.includes('jpg')) {
      extension = 'jpg';
    } else {
      console.warn(`Unsupported file format detected: ${format}. Defaulting to JPG.`);
    }

    const uniqueName = `profile_${Date.now()}_${Math.round(Math.random() * 1E9)}.${extension}`;
    
    // We target backend/public/uploads
    // __dirname is backend/utils, so go up one level to backend, then public/uploads
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

    // Ensure the folder exists on disk
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const absolutePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(absolutePath, buffer);

    console.log(`[PROFILE IMAGE SAVED] File successfully written to: ${absolutePath}`);
    return `/uploads/${uniqueName}`;
  } catch (error) {
    console.error('[IMAGE UPLOAD ERROR] Failed to parse base64 image:', error);
    return '';
  }
};
