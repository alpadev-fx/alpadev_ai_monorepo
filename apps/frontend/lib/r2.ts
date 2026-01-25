// Cloudflare R2 Public URL Configuration
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_URL || 'https://pub-17cfbc261d654bd0bcc5166f3bf46f6b.r2.dev';

/**
 * Helper to get the full R2 URL for an asset
 * @param path - The asset path (e.g., "/image.jpg" or "image.jpg")
 * @returns Full R2 URL
 */
export function getAssetUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${R2_PUBLIC_URL}/${cleanPath}`;
}
