import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { getCssFilterValue, getSharpModifiers } from '@/lib/filter-utils';
import { FILTER_PRESETS } from '@/constants/filters';
import { getCalibrationTestImage } from './fixtures/calibration-image';

/**
 * RGB color representation
 */
interface RgbColor {
	r: number;
	g: number;
	b: number;
}

/**
 * LAB color representation
 */
interface LabColor {
	L: number;
	a: number;
	b: number;
}

/**
 * Convert RGB to LAB color space
 * LAB is perceptually uniform, making it ideal for color difference calculations
 *
 * @param rgb - RGB color values (0-255)
 * @returns LAB color values
 */
function rgbToLab(rgb: RgbColor): LabColor {
	// 1. Convert RGB to linear RGB (gamma correction)
	let r = rgb.r / 255;
	let g = rgb.g / 255;
	let b = rgb.b / 255;

	// Apply gamma correction (sRGB to linear)
	const toLinear = (c: number): number =>
		c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

	r = toLinear(r);
	g = toLinear(g);
	b = toLinear(b);

	// 2. Convert linear RGB to XYZ
	// sRGB to XYZ transformation matrix (D65 illuminant)
	const X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
	const Y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
	const Z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

	// 3. Convert XYZ to LAB
	// D65 reference white point
	const Xn = 0.95047;
	const Yn = 1.0;
	const Zn = 1.08883;

	const toLab = (t: number): number =>
		t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;

	const fx = toLab(X / Xn);
	const fy = toLab(Y / Yn);
	const fz = toLab(Z / Zn);

	const L = 116 * fy - 16;
	const a = 500 * (fx - fy);
	const bb = 200 * (fy - fz);

	return { L, a, b: bb };
}

/**
 * Calculate CIE Delta E 1976 color difference
 * Delta E measures perceptual difference between two colors
 * - Delta E < 1.0: Not perceptible
 * - Delta E 1-2: Perceptible through close observation
 * - Delta E 2-10: Perceptible at a glance
 *
 * @param color1 - First RGB color
 * @param color2 - Second RGB color
 * @returns Delta E value (lower = more similar)
 */
export function deltaE(color1: RgbColor, color2: RgbColor): number {
	const lab1 = rgbToLab(color1);
	const lab2 = rgbToLab(color2);

	// Euclidean distance in LAB space
	const dL = lab1.L - lab2.L;
	const da = lab1.a - lab2.a;
	const db = lab1.b - lab2.b;

	return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Extract pixel color from image buffer at specified coordinates
 *
 * @param buffer - Image buffer
 * @param x - X coordinate (0-based)
 * @param y - Y coordinate (0-based)
 * @returns RGB color at coordinates
 */
async function extractColor(buffer: Buffer, x: number, y: number): Promise<RgbColor> {
	const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });

	const { width, channels } = info;
	const index = (y * width + x) * channels;

	return {
		r: data[index],
		g: data[index + 1],
		b: data[index + 2],
	};
}

describe('Delta-E Calculation', () => {
	it('should return 0 for identical colors', () => {
		const color1: RgbColor = { r: 128, g: 128, b: 128 };
		const color2: RgbColor = { r: 128, g: 128, b: 128 };

		expect(deltaE(color1, color2)).toBe(0);
	});

	it('should return non-zero for different colors', () => {
		const color1: RgbColor = { r: 255, g: 255, b: 255 };
		const color2: RgbColor = { r: 0, g: 0, b: 0 };

		expect(deltaE(color1, color2)).toBeGreaterThan(0);
	});

	it('should return higher values for more different colors', () => {
		const white: RgbColor = { r: 255, g: 255, b: 255 };
		const gray: RgbColor = { r: 128, g: 128, b: 128 };
		const black: RgbColor = { r: 0, g: 0, b: 0 };

		const whiteGrayDiff = deltaE(white, gray);
		const whiteBlackDiff = deltaE(white, black);

		expect(whiteBlackDiff).toBeGreaterThan(whiteGrayDiff);
	});

	it('should be symmetric', () => {
		const color1: RgbColor = { r: 100, g: 150, b: 200 };
		const color2: RgbColor = { r: 120, g: 130, b: 180 };

		expect(deltaE(color1, color2)).toBe(deltaE(color2, color1));
	});
});

describe('Color Extraction', () => {
	it('should extract color from test image', async () => {
		const buffer = await getCalibrationTestImage();
		const color = await extractColor(buffer, 50, 50);

		expect(color.r).toBeGreaterThanOrEqual(0);
		expect(color.r).toBeLessThanOrEqual(255);
		expect(color.g).toBeGreaterThanOrEqual(0);
		expect(color.g).toBeLessThanOrEqual(255);
		expect(color.b).toBeGreaterThanOrEqual(0);
		expect(color.b).toBeLessThanOrEqual(255);
	});

	it('should extract white from top of gradient', async () => {
		const buffer = await getCalibrationTestImage();
		const color = await extractColor(buffer, 50, 10);

		// Top should be close to white
		expect(color.r).toBeGreaterThan(200);
		expect(color.g).toBeGreaterThan(200);
		expect(color.b).toBeGreaterThan(200);
	});

	it('should extract black from bottom of gradient', async () => {
		const buffer = await getCalibrationTestImage();
		const color = await extractColor(buffer, 50, 90);

		// Bottom should be close to black
		expect(color.r).toBeLessThan(50);
		expect(color.g).toBeLessThan(50);
		expect(color.b).toBeLessThan(50);
	});
});
