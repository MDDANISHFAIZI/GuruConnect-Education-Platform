/**
 * Formats user/tutor profile photo URLs correctly.
 * If the path starts with '/uploads/', it prepends the backend port (http://localhost:5000).
 * Absolute URLs and base64 strings are left unchanged.
 * Falsy values are handled to return a fallback indicator.
 * @param {string} photoPath - The profile photo URL path from backend
 * @returns {string|null} - The formatted URL or null if empty
 */
export const getProfilePhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  
  // If it's already an absolute URL or a base64 string, return it as-is
  if (
    photoPath.startsWith('http://') || 
    photoPath.startsWith('https://') || 
    photoPath.startsWith('data:')
  ) {
    return photoPath;
  }
  
  // If it's a relative path starting with /uploads/ (or similar), prepend backend domain
  const backendBaseUrl = 'http://localhost:5000';
  const cleanedPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
  return `${backendBaseUrl}${cleanedPath}`;
};
