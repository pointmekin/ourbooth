import type { FilterType, FilterPreset } from "@/types/filters";

/**
 * Filter preset definitions
 * Single source of truth for all filter parameters
 * Values map 1:1 to CSS filters and Sharp operations
 */
export const FILTER_PRESETS: FilterPreset[] = [
	// ============ BLACK & WHITE ============
	{
		id: "noir",
		name: "Noir",
		category: "bw",
		parameters: {
			grayscale: 100,
			sepia: 0,
			saturation: 0,
			brightness: 105,
			contrast: 115,
		},
	},

	// ============ VINTAGE ============
	{
		id: "sepia",
		name: "Sepia",
		category: "vintage",
		parameters: {
			grayscale: 0,
			sepia: 80,
			saturation: 60,
			brightness: 102,
			contrast: 105,
		},
	},
	{
		id: "vintage",
		name: "Vintage",
		category: "vintage",
		parameters: {
			grayscale: 0,
			sepia: 40,
			saturation: 70,
			brightness: 95,
			contrast: 90,
		},
	},

	// ============ COLOR ============
	{
		id: "warm",
		name: "Warm",
		category: "color",
		parameters: {
			grayscale: 0,
			sepia: 20,
			saturation: 110,
			brightness: 102,
			contrast: 105,
		},
	},
	{
		id: "cool",
		name: "Cool",
		category: "color",
		parameters: {
			grayscale: 0,
			sepia: 0,
			saturation: 90,
			brightness: 98,
			contrast: 105,
		},
	},
	{
		id: "vivid",
		name: "Vivid",
		category: "color",
		parameters: {
			grayscale: 0,
			sepia: 0,
			saturation: 140,
			brightness: 100,
			contrast: 110,
		},
	},
	{
		id: "muted",
		name: "Muted",
		category: "color",
		parameters: {
			grayscale: 0,
			sepia: 0,
			saturation: 60,
			brightness: 100,
			contrast: 95,
		},
	},
];

/**
 * Filter category definitions
 */
export const FILTER_CATEGORIES: {
	id: "bw" | "color" | "vintage";
	label: string;
	icon: string;
}[] = [
	{ id: "bw", label: "Black & White", icon: "⚫" },
	{ id: "color", label: "Color", icon: "🎨" },
	{ id: "vintage", label: "Vintage", icon: "📜" },
];

/**
 * Get filter preset by ID
 * @param id - Filter identifier
 * @returns Filter preset or undefined if not found
 */
export function getFilterById(id: FilterType): FilterPreset | undefined {
	return FILTER_PRESETS.find((filter) => filter.id === id);
}

/**
 * Get all filter presets in a category
 * @param category - Filter category ('bw' | 'color' | 'vintage')
 * @returns Array of filter presets in the category
 */
export function getFiltersByCategory(
	category: "bw" | "color" | "vintage",
): FilterPreset[] {
	return FILTER_PRESETS.filter((filter) => filter.category === category);
}
