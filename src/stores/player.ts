import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { PlayerStatsResponse } from '@/types/player';
import { isPlayerStatsResponse } from '@/utils/validators';

const STATS_TTL_MS = 10 * 60 * 1000;

export const usePlayerStore = defineStore('player', () => {
  const stats = ref<PlayerStatsResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastFetched = ref<number | null>(null);

  function isStale(): boolean {
    return lastFetched.value === null || Date.now() - lastFetched.value > STATS_TTL_MS;
  }

  async function fetchStats({ force = false } = {}): Promise<void> {
    if (!force && !isStale()) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch('/mock_response.json');
      const json: unknown = await response.json();

      if (response.ok && isPlayerStatsResponse(json)) {
        stats.value = json;
        lastFetched.value = Date.now();
      } else {
        error.value = 'state.error';
      }
    } catch {
      error.value = 'state.error';
    } finally {
      loading.value = false;
    }
  }

  return { stats, loading, error, fetchStats };
});
