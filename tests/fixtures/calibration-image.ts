import sharp from 'sharp';

/**
 * Generate a calibration test image with known color values
 *
 * The image is a 100x100px gradient from white to black with a gray middle band.
 * This provides test points across the full brightness range:
 * - Top 33%: Pure white (#ffffff)
 * - Middle 33%: Middle gray (#808080)
 * - Bottom 33%: Pure black (#000000)
 *
 * @returns Buffer containing PNG test image
 */
export async function getCalibrationTestImage(): Promise<Buffer> {
	const width = 100;
	const height = 100;

	// Create SVG with gradient from white to black
	const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#808080"/>
          <stop offset="100%" stop-color="#000000"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
    </svg>
  `;

	return await sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Get calibration test image as base64 data URL
 * Useful for CSS rendering tests in browser-like environments
 *
 * @returns Base64-encoded data URL (data:image/png;base64,...)
 */
export async function getCalibrationTestImageDataUrl(): Promise<string> {
	const buffer = await getCalibrationTestImage();
	const base64 = buffer.toString('base64');
	return `data:image/png;base64,${base64}`;
}
