import { useFilterStore } from '@/stores/filter-store'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RotateCcw } from 'lucide-react'
import * as React from 'react'

const DEFAULT_INTENSITY = 75
const MIN_INTENSITY = 0
const MAX_INTENSITY = 100

const INTENSITY_PRESETS = [0, 25, 50, 75, 100] as const
type IntensityPreset = typeof INTENSITY_PRESETS[number]

// Snap threshold: distance in percentage where snap activates
const SNAP_THRESHOLD = 5

/**
 * Custom hook for snapping intensity values to nearest preset
 * @param value - Current intensity value
 * @param threshold - Distance within which snap activates
 * @returns Snapped value (or original if not near preset)
 */
function useSnapToPreset(value: number, threshold: number = SNAP_THRESHOLD) {
	return React.useMemo(() => {
		// Find nearest preset
		const nearestPreset = INTENSITY_PRESETS.reduce((nearest, preset) => {
			const currentDistance = Math.abs(value - preset)
			const nearestDistance = Math.abs(value - nearest)
			return currentDistance < nearestDistance ? preset : nearest
		}, INTENSITY_PRESETS[0])

		// Snap to preset if within threshold
		const distance = Math.abs(value - nearestPreset)
		return distance <= threshold ? nearestPreset : value
	}, [value, threshold])
}

interface IntensitySliderProps {
	disabled?: boolean
}

export function IntensitySlider({ disabled = false }: IntensitySliderProps) {
	const intensity = useFilterStore((s) => s.intensity)
	const selectedFilter = useFilterStore((s) => s.selectedFilter)
	const setIntensity = useFilterStore((s) => s.setIntensity)

	// React 19 useTransition for non-blocking updates
	const [isPending, startTransition] = React.useTransition()

	// Track drag state for snap behavior
	const [isDragging, setIsDragging] = React.useState(false)
	const [dragStartValue, setDragStartValue] = React.useState(intensity)

	const handleReset = () => {
		setIntensity(DEFAULT_INTENSITY)
	}

	// Calculate snapped value for display
	const snappedIntensity = useSnapToPreset(intensity)

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = Number(e.target.value)

		// Apply snap when dragging
		if (isDragging) {
			const nearestPreset = INTENSITY_PRESETS.reduce((nearest, preset) => {
				const currentDistance = Math.abs(rawValue - preset)
				const nearestDistance = Math.abs(rawValue - nearest)
				return currentDistance < nearestDistance ? preset : nearest
			}, INTENSITY_PRESETS[0])

			const distance = Math.abs(rawValue - nearestPreset)

			// Check if we're "breaking out" of a snap (moving away from preset)
			if (Math.abs(intensity - nearestPreset) < SNAP_THRESHOLD && distance > SNAP_THRESHOLD) {
				// Breaking out - use raw value
				setIntensity(rawValue)
			} else if (distance <= SNAP_THRESHOLD) {
				// Within snap zone - snap to preset
				setIntensity(nearestPreset)
			} else {
				// Not near any preset - use raw value
				setIntensity(rawValue)
			}
		} else {
			setIntensity(rawValue)
		}
	}

	const isAtDefault = intensity === DEFAULT_INTENSITY
	const hasFilter = selectedFilter !== null

	return (
		<div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
			{/* Header: Label + Value + Reset */}
			<div className="flex items-center justify-between gap-4">
				<Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
					Intensity
				</Label>
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold tabular-nums min-w-[3rem] text-right">
						{Math.round(intensity)}%
					</span>
					{hasFilter && !isAtDefault && (
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={handleReset}
							className="h-7 w-7 shrink-0"
							title="Reset to default"
						>
							<RotateCcw className="h-3.5 w-3.5" />
						</Button>
					)}
				</div>
			</div>

			{/* Slider */}
			<div className="relative">
				<input
					type="range"
					min={MIN_INTENSITY}
					max={MAX_INTENSITY}
					value={snappedIntensity}
					onChange={handleInputChange}
					onMouseDown={() => {
						setIsDragging(true)
						setDragStartValue(intensity)
					}}
					onMouseUp={() => setIsDragging(false)}
					onMouseLeave={() => setIsDragging(false)}
					disabled={disabled || !hasFilter}
					list="intensity-presets"
					className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-125
            disabled:opacity-50 disabled:cursor-not-allowed"
				/>
				<datalist id="intensity-presets">
					{INTENSITY_PRESETS.map((preset) => (
						<option key={preset} value={preset} />
					))}
				</datalist>

				{/* Tick marks overlay */}
				<div
					className="absolute inset-0 pointer-events-none flex justify-between items-center px-1"
					aria-hidden="true"
				>
					{INTENSITY_PRESETS.map((preset) => {
						const isActive = Math.abs(intensity - preset) < SNAP_THRESHOLD
						return (
							<button
								key={preset}
								type="button"
								onClick={() => setIntensity(preset)}
								disabled={disabled || !hasFilter}
								className="pointer-events-auto group relative"
								aria-label={`Set intensity to ${preset}%`}
							>
								<div
									className={`
					w-0.5 bg-muted-foreground/30 transition-all duration-150
					${isActive ? 'h-4 bg-foreground' : 'h-2 group-hover:bg-muted-foreground/50'}
				  `}
									style={{ marginTop: isActive ? '-2px' : '0' }}
								/>
							</button>
						)
					})}
				</div>
			</div>

			{/* Hint when no filter selected */}
			{!hasFilter && (
				<p className="text-xs text-muted-foreground text-center">
					Select a filter to adjust intensity
				</p>
			)}
		</div>
	)
}
