import https from 'https';
import crypto from 'crypto';

const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Uploads a base64 image data URL to Cloudinary via native https REST API.
 * Falls back to storing the base64 string directly in MongoDB if credentials are missing.
 *
 * @param {string} base64Str - The base64 data URL to upload/process
 * @param {string} currentPhotoUrl - The current profile photo URL in the database
 * @param {string} currentPublicId - The current Cloudinary public ID in the database
 * @returns {Promise<{url: string, publicId: string}>} - The secure URL and public ID of the uploaded image.
 */
export const uploadProfileImage = async (base64Str, currentPhotoUrl = '', currentPublicId = '') => {
  if (!base64Str) {
    return { url: '', publicId: '' };
  }

  // If it's the same URL as before, return it and keep the current public ID
  if (base64Str === currentPhotoUrl) {
    return { url: currentPhotoUrl, publicId: currentPublicId };
  }

  // If it is already a saved upload path or external URL, return it as-is
  if (
    base64Str.startsWith('http://') ||
    base64Str.startsWith('https://') ||
    base64Str.startsWith('/uploads/')
  ) {
    return { url: base64Str, publicId: '' };
  }

  // If it's a base64 Data URL, upload it
  if (base64Str.startsWith('data:')) {
    if (isCloudinaryConfigured()) {
      try {
        console.log('[CLOUDINARY] Uploading image via REST API...');
        const result = await uploadToCloudinary(base64Str);
        console.log(`[CLOUDINARY] Upload successful! URL: ${result.url} | Public ID: ${result.publicId}`);
        return result;
      } catch (error) {
        console.error('[CLOUDINARY] REST upload failed, falling back to database base64 storage:', error.message);
        return { url: base64Str, publicId: '' };
      }
    } else {
      console.warn('[CLOUDINARY] Not configured in .env. Storing base64 string directly in database.');
      return { url: base64Str, publicId: '' };
    }
  }

  // Fallback for any other format
  return { url: base64Str, publicId: '' };
};

// Helper: Make HTTP request to Cloudinary Upload REST API
const uploadToCloudinary = (base64Str) => {
  return new Promise((resolve, reject) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'guruconnect_profiles';
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex');

    const postData = JSON.stringify({
      file: base64Str,
      api_key: apiKey,
      timestamp: timestamp,
      signature: signature,
      folder: folder
    });

    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${cloudName}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              url: parsed.secure_url,
              publicId: parsed.public_id
            });
          } else {
            reject(new Error(parsed.error?.message || `HTTP Status ${res.statusCode}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
};

// Retain saveBase64Image for compatibility with any legacy imports
export const saveBase64Image = (base64Str) => {
  if (!base64Str) return '';
  return base64Str;
};
