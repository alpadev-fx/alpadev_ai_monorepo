// Cloudflare R2 Custom Domain Configuration
// assets.alpadev.xyz serves static files from R2
// alpadev.xyz serves the Next.js app from VPS
export const R2_PUBLIC_URL = 'https://assets.alpadev.xyz';

/**
 * Helper to get the full R2 URL for an asset
 * @param filename - The asset filename (e.g., "image.jpg")
 * @returns Full R2 URL with custom domain
 */
export function getAssetUrl(filename: string): string {
  // Remove leading slash if present
  const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
  return `${R2_PUBLIC_URL}/assets/${cleanFilename}`;
}
