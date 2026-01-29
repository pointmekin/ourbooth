import { useFilterStore } from '@/stores/filter-store'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RotateCcw } from 'lucide-react'

const DEFAULT_INTENSITY = 75
const MIN_INTENSITY = 0
const MAX_INTENSITY = 100

const INTENSITY_PRESETS = [0, 25, 50, 75, 100] as const
type IntensityPreset = typeof INTENSITY_PRESETS[number]

// Snap threshold: distance in percentage where snap activates
const SNAP_THRESHOLD = 5

interface IntensitySliderProps {
	disabled?: boolean
}

export function IntensitySlider({ disabled = false }: IntensitySliderProps) {
	const intensity = useFilterStore((s) => s.intensity)
	const selectedFilter = useFilterStore((s) => s.selectedFilter)
	const setIntensity = useFilterStore((s) => s.setIntensity)

	const handleReset = () => {
		setIntensity(DEFAULT_INTENSITY)
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
					value={intensity}
					onChange={(e) => setIntensity(Number(e.target.value))}
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
