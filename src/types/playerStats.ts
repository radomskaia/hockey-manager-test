import type { StatsRowKey } from '@/types/player';

export const TAB = {
  RECENT: 'recent',
  HISTORY: 'history',
} as const;

export type Tab = (typeof TAB)[keyof typeof TAB];

export interface Column {
  key: StatsRowKey;
  labelKey: string;
  align?: 'left';
}

export interface TabConfig {
  value: Tab;
  labelKey: string;
  rowKey?: StatsRowKey;
  columns: Column[];
  gridTemplate: string;
}
