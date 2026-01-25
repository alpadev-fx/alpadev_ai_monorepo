// Cloudflare R2 Custom Domain Configuration
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://alpadev.xyz';

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

