/**
 * Filter type identifiers
 * Represents all available filter presets in the system
 */
export type FilterType =
	| "noir"
	| "sepia"
	| "vintage"
	| "warm"
	| "cool"
	| "vivid"
	| "muted";

/**
 * Filter parameter values
 * Unified parameter set that maps to both CSS filters and Sharp operations
 *
 * All values use CSS filter units:
 * - grayscale: 0-100% (0 = full color, 100 = grayscale)
 * - sepia: 0-100% (0 = no sepia, 100 = full sepia)
 * - saturation: 0-200% (100 = normal, <100 = desaturated, >100 = saturated)
 * - brightness: 50-150% (100 = normal, <100 = darker, >100 = brighter)
 * - contrast: 50-150% (100 = normal, <100 = lower contrast, >100 = higher contrast)
 */
export interface FilterParameters {
	grayscale: number;
	sepia: number;
	saturation: number;
	brightness: number;
	contrast: number;
}

/**
 * Filter preset definition
 * Combines metadata with filter parameters
 */
export interface FilterPreset {
	id: FilterType;
	name: string;
	category: "bw" | "color" | "vintage";
	parameters: FilterParameters;
}
