import type { FilterParameters } from '@/types/filters';

// Constants for filter scaling
const BASELINE_INTENSITY = 100; // Normal/neutral value for brightness/contrast/saturation
const MAX_PIXEL_VALUE = 255; // Max pixel value for contrast linear adjustment
const SEPIA_DIVISOR = 200; // Divisor for sepia saturation reduction

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
 * For brightness/contrast: interpolates between BASELINE_INTENSITY and the target value
 * For other parameters: interpolates between 0 and the target value
 *
 * @param value - Target parameter value
 * @param intensity - Intensity percentage (0-100)
 * @param baseline - Baseline value (default 0, use BASELINE_INTENSITY for brightness/contrast)
 * @returns Scaled parameter value
 */
function scaleParameter(value: number, intensity: number, baseline = 0): number {
	const intensityRatio = intensity / BASELINE_INTENSITY;
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
	const saturate = scaleParameter(parameters.saturation, intensity, BASELINE_INTENSITY);
	const brightness = scaleParameter(parameters.brightness, intensity, BASELINE_INTENSITY);
	const contrast = scaleParameter(parameters.contrast, intensity, BASELINE_INTENSITY);

	// Build filter string with non-zero values only
	// Order: grayscale, sepia, saturate, brightness, contrast
	if (grayscale > 0) {
		filters.push(`grayscale(${grayscale}%)`);
	}
	if (sepia > 0) {
		filters.push(`sepia(${sepia}%)`);
	}
	if (saturate !== BASELINE_INTENSITY && saturate > 0) {
		// Only include if not baseline and not zero
		filters.push(`saturate(${saturate}%)`);
	}
	if (brightness !== BASELINE_INTENSITY) {
		// Only include if not baseline
		filters.push(`brightness(${brightness}%)`);
	}
	if (contrast !== BASELINE_INTENSITY) {
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
			saturation: BASELINE_INTENSITY,
			brightness: BASELINE_INTENSITY,
			contrastLow: null,
			contrastHigh: null,
		};
	}

	// Scale each parameter
	const grayscale = scaleParameter(parameters.grayscale, intensity);
	const sepia = scaleParameter(parameters.sepia, intensity);
	const saturation = scaleParameter(parameters.saturation, intensity, BASELINE_INTENSITY);
	const brightness = scaleParameter(parameters.brightness, intensity, BASELINE_INTENSITY);
	const contrast = scaleParameter(parameters.contrast, intensity, BASELINE_INTENSITY);

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
		sharpSaturation = saturation * (1 - sepia / SEPIA_DIVISOR);
	}

	// Map contrast to linear adjustment parameters
	// Sharp's linear() uses slope/intercept to adjust contrast
	// Contrast < BASELINE_INTENSITY: expand midtones (reduce contrast)
	// Contrast > BASELINE_INTENSITY: compress midtones (increase contrast)
	let contrastLow: number | null = null;
	let contrastHigh: number | null = null;

	if (contrast !== BASELINE_INTENSITY) {
		if (contrast > BASELINE_INTENSITY) {
			// Increase contrast: slope > 1
			const slope = contrast / BASELINE_INTENSITY;
			contrastLow = -MAX_PIXEL_VALUE * (slope - 1);
			contrastHigh = MAX_PIXEL_VALUE + MAX_PIXEL_VALUE * (slope - 1);
		} else {
			// Decrease contrast: slope < 1
			const slope = contrast / BASELINE_INTENSITY;
			contrastLow = MAX_PIXEL_VALUE * (1 - slope);
			contrastHigh = MAX_PIXEL_VALUE - MAX_PIXEL_VALUE * (1 - slope);
		}
	}

	return {
		saturation: sharpSaturation,
		brightness: sharpBrightness,
		contrastLow,
		contrastHigh,
	};
}
