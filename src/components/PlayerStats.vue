<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { TAB, tabConfigByValue, tabs } from '@/components/PlayerStats.config'
import type { Tab } from '@/components/PlayerStats.config'
import { usePlayerStore } from '@/stores/player'
import type { StatsRowKey } from '@/types/player'

type StatsRecord = Partial<Record<StatsRowKey, unknown>>

const store = usePlayerStore()
const { stats, loading, error } = storeToRefs(store)
const activeTab = ref<Tab>(TAB.RECENT)
const { t } = useI18n()

const activeView = computed(() => {
  const isRecent = activeTab.value === TAB.RECENT
  const rawRows = isRecent ? (stats.value?.recent_games ?? []) : (stats.value?.seasonStats ?? [])

  const config = tabConfigByValue[activeTab.value]

  return {
    columns: config.columns,
    rows: rawRows,
    rowKey: config.rowKey ?? null,
  }
})

function getCellValue(row: StatsRecord, key: StatsRowKey): unknown {
  return row[key]
}

function getRowKey(row: StatsRecord, index: number): string | number {
  const key = activeView.value.rowKey
  if (!key) return index

  const value = getCellValue(row, key)

  return value == null || value === '' ? index : String(value)
}

onMounted(() => {
  void store.fetchStats()
})
</script>

<template>
  <div class="player-stats">
    <div class="player-stats__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="player-stats__tab"
        :class="{ 'player-stats__tab--active': activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ t(tab.labelKey) }}
      </button>
    </div>

    <div
      v-if="loading"
      class="player-stats__state"
    >
      {{ t('state.loading') }}
    </div>

    <div
      v-else-if="error"
      class="player-stats__state player-stats__state--error"
    >
      {{ t(error) }}
    </div>

    <div
      v-else-if="stats"
      class="player-stats__body"
    >
      <table class="stats-table">
        <thead>
          <tr>
            <th
              v-for="col in activeView.columns"
              :key="col.key"
              :class="{ 'stats-table__col--left': col.align === 'left' }"
            >
              {{ t(col.labelKey) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in activeView.rows"
            :key="getRowKey(row, index)"
          >
            <td
              v-for="col in activeView.columns"
              :key="col.key"
              :class="{ 'stats-table__col--left': col.align === 'left' }"
            >
              {{ getCellValue(row, col.key) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./PlayerStats.scss"></style>
