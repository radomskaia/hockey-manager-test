<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import PlayerStats from '@/components/PlayerStats.vue';
import { LOCALES } from '@/plugins/i18n';
import type { AppLocale } from '@/plugins/i18n';
import { THEMES } from '@/plugins/theme';
import type { AppTheme } from '@/plugins/theme';

const { locale } = useI18n();

const nextLocale = computed(() => {
  const current = LOCALES.indexOf(locale.value as AppLocale);

  return LOCALES[(current + 1) % LOCALES.length].toUpperCase();
});

function toggleLocale(): void {
  const current = LOCALES.indexOf(locale.value as AppLocale);
  locale.value = LOCALES[(current + 1) % LOCALES.length];
}

const THEME_KEY = 'app-theme';

const theme = ref<AppTheme>((localStorage.getItem(THEME_KEY) as AppTheme | null) ?? THEMES[0]);

const nextTheme = computed(() => {
  const current = THEMES.indexOf(theme.value);

  return THEMES[(current + 1) % THEMES.length];
});

watch(
  theme,
  (t) => {
    document.documentElement.dataset.theme = t;
    localStorage.setItem(THEME_KEY, t);
  },
  { immediate: true }
);

function toggleTheme(): void {
  theme.value = nextTheme.value;
}
</script>

<template>
  <main class="home-view">
    <div class="home-view__toolbar">
      <button
        class="home-view__btn"
        @click="toggleTheme"
      >
        {{ nextTheme }}
      </button>
      <button
        class="home-view__btn"
        @click="toggleLocale"
      >
        {{ nextLocale }}
      </button>
    </div>
    <PlayerStats />
  </main>
</template>

<style scoped lang="scss">
.home-view {
  max-width: 94rem;
  margin: 0 auto;
  padding: 2.5rem 1.25rem;

  &__toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  &__btn {
    font-family: inherit;
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: $color-text-muted;
    background: none;
    border: 1px solid $color-text-muted;
    border-radius: var(--border-radius);
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    transition:
      color 0.15s,
      border-color 0.15s;

    &:hover {
      color: $color-primary;
      border-color: $color-primary;
    }
  }
}
</style>
