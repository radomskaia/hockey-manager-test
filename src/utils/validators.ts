import type {PlayerStatsResponse, RecentGame, SeasonStat} from '@/types/player'

function isRecentGame(item: unknown): item is RecentGame {
    if (typeof item !== 'object' || item === null) {
        return false
    }

    const game = item as Record<string, unknown>

    return (
        typeof game['match'] === 'string' &&
        typeof game['G'] === 'number' &&
        typeof game['P'] === 'number' &&
        typeof game['PM'] === 'number' &&
        typeof game['PIM'] === 'number' &&
        typeof game['PP'] === 'string' &&
        typeof game['FO'] === 'string' &&
        typeof game['ice_time'] === 'string' &&
        typeof game['SOG'] === 'string'
    )
}

function isSeasonStat(item: unknown): item is SeasonStat {
    if (typeof item !== 'object' || item === null) {
        return false
    }

    const stat = item as Record<string, unknown>

    return (
        typeof stat['season'] === 'number' &&
        typeof stat['team'] === 'string' &&
        typeof stat['GP'] === 'number' &&
        typeof stat['G'] === 'number' &&
        typeof stat['A'] === 'number' &&
        typeof stat['P'] === 'number' &&
        typeof stat['PM'] === 'number' &&
        typeof stat['PIM'] === 'number' &&
        typeof stat['ice_time'] === 'string'
    )
}

export function isPlayerStatsResponse(response: unknown): response is PlayerStatsResponse {
    if (typeof response !== 'object' || response === null) {
        return false
    }

    const data = response as Record<string, unknown>

    return (
        Array.isArray(data['recent_games']) &&
        data['recent_games'].every((item) => isRecentGame(item)) &&
        Array.isArray(data['seasonStats']) &&
        data['seasonStats'].every((item) => isSeasonStat(item))
    )
}
