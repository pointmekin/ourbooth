import { describe, it, expect } from 'vitest';
import { getCssFilterValue, getSharpModifiers } from './filter-utils';
import type { FilterParameters } from '@/types/filters';

describe('getCssFilterValue', () => {
	it('returns "none" when intensity is 0', () => {
		const params: FilterParameters = {
			grayscale: 100,
			sepia: 0,
			saturation: 0,
			brightness: 105,
			contrast: 115,
		};
		expect(getCssFilterValue(params, 0)).toBe('none');
	});

	it('returns all non-zero parameters at full intensity (100%)', () => {
		const params: FilterParameters = {
			grayscale: 100,
			sepia: 0,
			saturation: 80,
			brightness: 102,
			contrast: 105,
		};
		const result = getCssFilterValue(params, 100);
		expect(result).toContain('grayscale(100%)');
		expect(result).toContain('saturate(80%)');
		expect(result).toContain('brightness(102%)');
		expect(result).toContain('contrast(105%)');
		expect(result).not.toContain('sepia');
	});

	it('returns half-strength values at 50% intensity', () => {
		const params: FilterParameters = {
			grayscale: 100,
			sepia: 0,
			saturation: 0,
			brightness: 105,
			contrast: 115,
		};
		const result = getCssFilterValue(params, 50);

		// Grayscale: 100 * 0.5 = 50
		expect(result).toContain('grayscale(50%)');

		// Brightness: 100 + (105-100) * 0.5 = 102.5
		expect(result).toContain('brightness(102.5%)');

		// Contrast: 100 + (115-100) * 0.5 = 107.5
		expect(result).toContain('contrast(107.5%)');
	});

	it('omits zero-valued parameters from output', () => {
		const params: FilterParameters = {
			grayscale: 0,
			sepia: 0,
			saturation: 0,
			brightness: 100,
			contrast: 100,
		};
		const result = getCssFilterValue(params, 100);

		// Should only have brightness and contrast (at baseline 100, should be omitted)
		// Actually at baseline values, they might not appear
		expect(result).not.toContain('grayscale');
		expect(result).not.toContain('sepia');
		expect(result).not.toContain('saturate');
	});

	it('outputs parameters in consistent order', () => {
		const params: FilterParameters = {
			grayscale: 50,
			sepia: 30,
			saturation: 80,
			brightness: 105,
			contrast: 110,
		};
		const result = getCssFilterValue(params, 100);

		// Check order: grayscale, sepia, saturate, brightness, contrast
		const grayscaleIndex = result.indexOf('grayscale');
		const sepiaIndex = result.indexOf('sepia');
		const saturateIndex = result.indexOf('saturate');
		const brightnessIndex = result.indexOf('brightness');
		const contrastIndex = result.indexOf('contrast');

		expect(grayscaleIndex).toBeLessThan(sepiaIndex);
		expect(sepiaIndex).toBeLessThan(saturateIndex);
		expect(saturateIndex).toBeLessThan(brightnessIndex);
		expect(brightnessIndex).toBeLessThan(contrastIndex);
	});
});

describe('getSharpModifiers', () => {
	it('returns identity values when intensity is 0', () => {
		const params: FilterParameters = {
			grayscale: 100,
			sepia: 80,
			saturation: 60,
			brightness: 102,
			contrast: 105,
		};
		const result = getSharpModifiers(params, 0);

		expect(result.saturation).toBe(100); // Identity for saturation
		expect(result.brightness).toBe(100); // Identity for brightness
		expect(result.contrastLow).toBeNull();
		expect(result.contrastHigh).toBeNull();
	});

	it('returns full parameter values at 100% intensity', () => {
		const params: FilterParameters = {
			grayscale: 0,
			sepia: 0,
			saturation: 140,
			brightness: 100,
			contrast: 110,
		};
		const result = getSharpModifiers(params, 100);

		expect(result.saturation).toBe(140);
		expect(result.brightness).toBe(100);
		expect(result.contrastLow).not.toBeNull();
		expect(result.contrastHigh).not.toBeNull();
	});

	it('returns interpolated values at 50% intensity', () => {
		const params: FilterParameters = {
			grayscale: 0,
			sepia: 0,
			saturation: 140,
			brightness: 105,
			contrast: 110,
		};
		const result = getSharpModifiers(params, 50);

		// Saturation: 140 * 0.5 offset from 100 = 100 + 40 * 0.5 = 120
		expect(result.saturation).toBe(120);

		// Brightness: 100 + (105-100) * 0.5 = 102.5
		expect(result.brightness).toBe(102.5);
	});

	it('maps grayscale to saturation=0 when grayscale > 0', () => {
		const params: FilterParameters = {
			grayscale: 100,
			sepia: 0,
			saturation: 0,
			brightness: 105,
			contrast: 115,
		};
		const result = getSharpModifiers(params, 100);

		// Grayscale should force saturation to 0
		expect(result.saturation).toBe(0);
	});

	it('maps sepia to reduced saturation and warm tint', () => {
		const params: FilterParameters = {
			grayscale: 0,
			sepia: 80,
			saturation: 60,
			brightness: 102,
			contrast: 105,
		};
		const result = getSharpModifiers(params, 100);

		// Sepia reduces saturation
		expect(result.saturation).toBeLessThan(100);
		expect(result.saturation).toBeGreaterThan(0);

		// Brightness should reflect sepia warmth
		expect(result.brightness).toBe(102);
	});

	it('maps saturation directly to modulate saturation', () => {
		const params: FilterParameters = {
			grayscale: 0,
			sepia: 0,
			saturation: 140,
			brightness: 100,
			contrast: 100,
		};
		const result = getSharpModifiers(params, 100);

		expect(result.saturation).toBe(140);
	});

	it('maps brightness directly to modulate brightness', () => {
		const params: FilterParameters = {
			grayscale: 0,
			sepia: 0,
			saturation: 100,
			brightness: 105,
			contrast: 100,
		};
		const result = getSharpModifiers(params, 100);

		expect(result.brightness).toBe(105);
	});

	it('maps contrast to linear parameters', () => {
		const params: FilterParameters = {
			grayscale: 0,
			sepia: 0,
			saturation: 100,
			brightness: 100,
			contrast: 115,
		};
		const result = getSharpModifiers(params, 100);

		// Contrast should map to linear adjustment
		expect(result.contrastLow).not.toBeNull();
		expect(result.contrastHigh).not.toBeNull();
	});
});
