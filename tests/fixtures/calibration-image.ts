import sharp from 'sharp';

/**
 * Generate a calibration test image with known color values
 *
 * The image is a 100x100px with 4 color bands:
 * - Top 25%: Pure red (#ff0000) - for saturation tests
 * - 25-50%: Pure white (#ffffff) - for brightness tests
 * - 50-75%: Middle gray (#808080) - mid-range reference
 * - Bottom 25%: Pure black (#000000) - for contrast tests
 *
 * @returns Buffer containing PNG test image
 */
export async function getCalibrationTestImage(): Promise<Buffer> {
	const width = 100;
	const height = 100;

	// Create SVG with horizontal color bands
	const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Pure red band for saturation tests -->
      <rect x="0" y="0" width="${width}" height="25" fill="#ff0000"/>
      <!-- Pure white band for brightness tests -->
      <rect x="0" y="25" width="${width}" height="25" fill="#ffffff"/>
      <!-- Middle gray band -->
      <rect x="0" y="50" width="${width}" height="25" fill="#808080"/>
      <!-- Pure black band for contrast tests -->
      <rect x="0" y="75" width="${width}" height="25" fill="#000000"/>
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
