import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { PlayerStatsResponse } from '@/types/player'
import { isPlayerStatsResponse } from '@/utils/validators'

export const usePlayerStore = defineStore('player', () => {
  const stats = ref<PlayerStatsResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStats() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/mock_response.json')
      const json: unknown = await response.json()

      if (response.ok && isPlayerStatsResponse(json)) {
        stats.value = json
      } else {
        error.value = 'state.error'
      }
    } catch {
      error.value = 'state.error'
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, error, fetchStats }
})
