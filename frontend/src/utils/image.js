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
  const backendBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const cleanedPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
  return `${backendBaseUrl}${cleanedPath}`;
};

/**
 * Fallback handler for profile images that fail to load (e.g. 404 error).
 * Replaces the source with a clean, vector SVG user avatar.
 * @param {Event} e - The image error event
 */
export const handleProfileImageError = (e) => {
  e.target.onerror = null;
  e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5'><path d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/></svg>";
  e.target.style.backgroundColor = '#f1f5f9'; // bg-slate-100 equivalent
  e.target.style.padding = '15%';
};
