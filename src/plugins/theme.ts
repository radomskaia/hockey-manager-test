const themes = ['light', 'dark'] as const

export type AppTheme = (typeof themes)[number]

export const THEMES = themes as unknown as AppTheme[]
