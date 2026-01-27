import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FilterType } from '@/types/filters'

/**
 * Filter state interface
 * Manages the currently selected filter and its intensity
 */
export interface FilterState {
	// State
	selectedFilter: FilterType | null
	intensity: number

	// Actions
	setSelectedFilter: (filter: FilterType | null) => void
	setIntensity: (intensity: number) => void
	reset: () => void
}

/**
 * Initial state for filter store
 */
const initialState = {
	selectedFilter: null as FilterType | null,
	intensity: 75,
}

/**
 * Filter store with localStorage persistence
 *
 * Provides global access to the selected filter and intensity value.
 * Persists to localStorage to survive page refreshes.
 */
export const useFilterStore = create<FilterState>()(
	persist(
		(set) => ({
			...initialState,

			setSelectedFilter: (filter) => set({ selectedFilter: filter }),

			setIntensity: (intensity) =>
				set({
					intensity: Math.max(0, Math.min(100, intensity)),
				}),

			reset: () => set(initialState),
		}),
		{
			name: 'ourbooth-filter-storage',
			// Skip persistence in non-browser environments (SSR)
			skipHydration: typeof window === 'undefined',
		},
	),
)
