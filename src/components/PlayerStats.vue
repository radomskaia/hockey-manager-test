<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import CustomScrollbar from '@/components/CustomScrollbar.vue';
import { TAB, tabConfigByValue, tabs } from '@/components/PlayerStats.config';
import type { Tab } from '@/components/PlayerStats.config';
import { usePlayerStore } from '@/stores/player';
import type { StatsRowKey } from '@/types/player';

type StatsRecord = Partial<Record<StatsRowKey, unknown>>;

type MatchParts = {
  home: string;
  score: string;
  away: string;
};

type ProcessedRow = StatsRecord & { matchParts: MatchParts | null };

const store = usePlayerStore();
const { stats, loading, error } = storeToRefs(store);
const activeTab = ref<Tab>(TAB.RECENT);
const { t } = useI18n();

const scrollBodyRef = ref<HTMLElement | null>(null);
const scrollbarRef = ref<InstanceType<typeof CustomScrollbar> | null>(null);
const hasVerticalScroll = ref(false);

const activeView = computed(() => {
  const isRecent = activeTab.value === TAB.RECENT;
  const rawRows = isRecent ? (stats.value?.recent_games ?? []) : (stats.value?.seasonStats ?? []);

  const config = tabConfigByValue[activeTab.value];

  const rows: ProcessedRow[] = rawRows.map((row) => ({
    ...row,
    matchParts: isRecent ? getMatchParts(row) : null,
  }));

  return {
    columns: config.columns,
    rows,
    rowKey: config.rowKey ?? null,
    gridTemplate: config.gridTemplate,
  };
});

function getCellValue(row: StatsRecord, key: StatsRowKey): unknown {
  return row[key];
}

function getRowKey(row: StatsRecord, index: number): string | number {
  const key = activeView.value.rowKey;

  if (!key) {
    return index;
  }

  const value = getCellValue(row, key);

  return value == null || value === '' ? index : String(value);
}

function getMatchParts(row: StatsRecord): MatchParts | null {
  const raw = getCellValue(row, 'match');

  if (typeof raw !== 'string') {
    return null;
  }

  const match = raw.match(/^(.*?)\s+(\d+:\d+)\s+(.*)$/u);

  if (!match) {
    return null;
  }

  return {
    home: match[1].trim(),
    score: match[2].trim(),
    away: match[3].trim(),
  };
}

watch(
  () => [activeTab.value, stats.value],
  async () => {
    await nextTick();
    scrollbarRef.value?.update();
  },
);

async function refresh(): Promise<void> {
  await store.fetchStats();
  await nextTick();
  scrollbarRef.value?.update();
}

async function handleVisibilityChange(): Promise<void> {
  if (document.visibilityState === 'visible') {
    await refresh();
  }
}

onMounted(async () => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
  await refresh();
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
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
      <div
        class="stats-table"
        :style="{
          '--stats-grid': activeView.gridTemplate,
          '--scrollbar-space': hasVerticalScroll ? undefined : '0px',
        }"
      >
        <div class="stats-table__head">
          <div class="stats-table__head-row">
            <div
              v-for="col in activeView.columns"
              :key="col.key"
              class="stats-table__cell stats-table__cell--head"
            >
              {{ t(col.labelKey) }}
            </div>

            <div
              v-if="hasVerticalScroll"
              class="stats-table__head-spacer"
            />
          </div>
        </div>

        <div class="stats-table__body-shell">
          <div
            ref="scrollBodyRef"
            class="stats-table__body-scroll"
          >
            <div class="stats-table__body-content">
              <div
                v-for="(row, index) in activeView.rows"
                :key="getRowKey(row, index)"
                class="stats-table__body-row"
              >
                <div
                  v-for="col in activeView.columns"
                  :key="col.key"
                  class="stats-table__cell"
                >
                  <template v-if="col.key === 'match'">
                    <div
                      v-if="row.matchParts"
                      class="stats-table__match"
                    >
                      <span class="stats-table__match-team stats-table__match-team--right">
                        {{ row.matchParts.home }}
                      </span>
                      <span class="stats-table__match-score">
                        {{ row.matchParts.score }}
                      </span>
                      <span class="stats-table__match-team">
                        {{ row.matchParts.away }}
                      </span>
                    </div>

                    <template v-else>
                      {{ getCellValue(row, col.key) }}
                    </template>
                  </template>

                  <template v-else>
                    {{ getCellValue(row, col.key) }}
                  </template>
                </div>
              </div>
            </div>
          </div>

          <CustomScrollbar
            ref="scrollbarRef"
            :scroll-element="scrollBodyRef"
            @update:has-scroll="hasVerticalScroll = $event"
          />
          <CustomScrollbar
            direction="horizontal"
            :scroll-element="scrollBodyRef"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="./PlayerStats.scss"></style>
