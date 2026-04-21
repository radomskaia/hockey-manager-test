interface GameInfo {
  G: number;
  P: number;
  PM: number;
  PIM: number;
  ice_time: string;
}

export interface RecentGame extends GameInfo {
  match: string;
  PP: string;
  FO: string;
  SOG: string;
}

export interface SeasonStat extends GameInfo {
  season: number;
  team: string;
  GP: number;
  A: number;
}

export interface PlayerStatsResponse {
  recent_games: RecentGame[];
  seasonStats: SeasonStat[];
}

export type StatsRowKey = keyof RecentGame | keyof SeasonStat;
