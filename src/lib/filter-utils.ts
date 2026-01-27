import type { FilterParameters } from '@/types/filters';

/**
 * Sharp modifier parameters for image processing
 * Maps filter parameters to Sharp API operations
 */
export interface SharpModifiers {
	/** Saturation multiplier for sharp.modulate() (100 = normal) */
	saturation: number;
	/** Brightness multiplier for sharp.modulate() (100 = normal) */
	brightness: number;
	/** Contrast low point for sharp.linear() (null if no contrast adjustment) */
	contrastLow: number | null;
	/** Contrast high point for sharp.linear() (null if no contrast adjustment) */
	contrastHigh: number | null;
}

/**
 * Scale a filter parameter by intensity
 * For brightness/contrast: interpolates between 100 (baseline) and the target value
 * For other parameters: interpolates between 0 and the target value
 *
 * @param value - Target parameter value
 * @param intensity - Intensity percentage (0-100)
 * @param baseline - Baseline value (default 0, use 100 for brightness/contrast)
 * @returns Scaled parameter value
 */
function scaleParameter(value: number, intensity: number, baseline = 0): number {
	const intensityRatio = intensity / 100;
	return baseline + (value - baseline) * intensityRatio;
}

/**
 * Generate CSS filter string from filter parameters
 *
 * @param parameters - Filter parameters to convert
 * @param intensity - Intensity percentage (0-100)
 * @returns CSS filter string (e.g., "grayscale(100%) contrast(115%)") or "none" if intensity is 0
 */
export function getCssFilterValue(
	parameters: FilterParameters,
	intensity: number
): string {
	// Zero intensity means no filter
	if (intensity <= 0) {
		return 'none';
	}

	const filters: string[] = [];

	// Scale each parameter
	const grayscale = scaleParameter(parameters.grayscale, intensity);
	const sepia = scaleParameter(parameters.sepia, intensity);
	const saturate = scaleParameter(parameters.saturation, intensity, 100);
	const brightness = scaleParameter(parameters.brightness, intensity, 100);
	const contrast = scaleParameter(parameters.contrast, intensity, 100);

	// Build filter string with non-zero values only
	// Order: grayscale, sepia, saturate, brightness, contrast
	if (grayscale > 0) {
		filters.push(`grayscale(${grayscale}%)`);
	}
	if (sepia > 0) {
		filters.push(`sepia(${sepia}%)`);
	}
	if (saturate !== 100 && saturate > 0) {
		// Only include if not baseline and not zero
		filters.push(`saturate(${saturate}%)`);
	}
	if (brightness !== 100) {
		// Only include if not baseline
		filters.push(`brightness(${brightness}%)`);
	}
	if (contrast !== 100) {
		// Only include if not baseline
		filters.push(`contrast(${contrast}%)`);
	}

	return filters.length > 0 ? filters.join(' ') : 'none';
}

/**
 * Generate Sharp modifier parameters from filter parameters
 *
 * @param parameters - Filter parameters to convert
 * @param intensity - Intensity percentage (0-100)
 * @returns Sharp modifiers for modulate/linear operations
 */
export function getSharpModifiers(
	parameters: FilterParameters,
	intensity: number
): SharpModifiers {
	// Zero intensity means identity values (no change)
	if (intensity <= 0) {
		return {
			saturation: 100,
			brightness: 100,
			contrastLow: null,
			contrastHigh: null,
		};
	}

	// Scale each parameter
	const grayscale = scaleParameter(parameters.grayscale, intensity);
	const sepia = scaleParameter(parameters.sepia, intensity);
	const saturation = scaleParameter(parameters.saturation, intensity, 100);
	const brightness = scaleParameter(parameters.brightness, intensity, 100);
	const contrast = scaleParameter(parameters.contrast, intensity, 100);

	// Map to Sharp operations
	let sharpSaturation = saturation;
	let sharpBrightness = brightness;

	// Grayscale forces saturation to 0
	if (grayscale > 0) {
		sharpSaturation = 0;
	}
	// Sepia reduces saturation and applies warm tint
	else if (sepia > 0) {
		// Sepia in Sharp is simulated by reducing saturation
		sharpSaturation = saturation * (1 - sepia / 200);
	}

	// Map contrast to linear adjustment parameters
	// Sharp's linear() uses slope/intercept to adjust contrast
	// Contrast < 100: expand midtones (reduce contrast)
	// Contrast > 100: compress midtones (increase contrast)
	let contrastLow: number | null = null;
	let contrastHigh: number | null = null;

	if (contrast !== 100) {
		if (contrast > 100) {
			// Increase contrast: slope > 1
			const slope = contrast / 100;
			contrastLow = -255 * (slope - 1);
			contrastHigh = 255 + 255 * (slope - 1);
		} else {
			// Decrease contrast: slope < 1
			const slope = contrast / 100;
			contrastLow = 255 * (1 - slope);
			contrastHigh = 255 - 255 * (1 - slope);
		}
	}

	return {
		saturation: sharpSaturation,
		brightness: sharpBrightness,
		contrastLow,
		contrastHigh,
	};
}
