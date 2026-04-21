import type { Tab, TabConfig } from '@/types/playerStats'
import { TAB } from '@/types/playerStats'

export { TAB } from '@/types/playerStats'
export type { Column, Tab, TabConfig } from '@/types/playerStats'

export const tabConfigByValue: Record<Tab, TabConfig> = {
  [TAB.RECENT]: {
    value: TAB.RECENT,
    labelKey: 'tabs.recentGames',
    gridTemplate: 'minmax(19rem, 4fr) repeat(8, minmax(2rem, 1fr))',
    columns: [
      { key: 'match', labelKey: 'col.match', align: 'left' },
      { key: 'G', labelKey: 'col.goals' },
      { key: 'P', labelKey: 'col.points' },
      { key: 'PM', labelKey: 'col.plusMinus' },
      { key: 'PIM', labelKey: 'col.penalty' },
      { key: 'PP', labelKey: 'col.powerPlay' },
      { key: 'FO', labelKey: 'col.faceoff' },
      { key: 'ice_time', labelKey: 'col.iceTime' },
      { key: 'SOG', labelKey: 'col.shots' },
    ],
  },
  [TAB.HISTORY]: {
    value: TAB.HISTORY,
    labelKey: 'tabs.history',
    rowKey: 'season',
    gridTemplate: 'minmax(5rem, 0.8fr) minmax(10rem, 1.4fr) repeat(7, minmax(5.5rem, 1fr))',
    columns: [
      { key: 'season', labelKey: 'col.season' },
      { key: 'team', labelKey: 'col.team', align: 'left' },
      { key: 'GP', labelKey: 'col.games' },
      { key: 'G', labelKey: 'col.goals' },
      { key: 'A', labelKey: 'col.assists' },
      { key: 'P', labelKey: 'col.points' },
      { key: 'PM', labelKey: 'col.plusMinus' },
      { key: 'PIM', labelKey: 'col.penalty' },
      { key: 'ice_time', labelKey: 'col.iceTime' },
    ],
  },
}

export const tabs = Object.values(tabConfigByValue)
