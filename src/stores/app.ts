import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const appName = ref('Hockey Manager');
  const initializedAt = ref(new Date().toISOString());

  const appTitle = computed(() => `${appName.value} Frontend`);

  return {
    appName,
    appTitle,
    initializedAt,
  };
});
