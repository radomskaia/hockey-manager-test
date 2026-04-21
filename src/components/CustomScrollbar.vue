<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';

const trackRef = ref<HTMLElement | null>(null);

const props = defineProps<{
  scrollElement: HTMLElement | null;
  direction?: 'vertical' | 'horizontal';
}>();

const emit = defineEmits<{
  'update:hasScroll': [value: boolean];
}>();

type AxisConfig = {
  scrollPos: 'scrollTop' | 'scrollLeft';
  scrollSize: 'scrollHeight' | 'scrollWidth';
  clientSize: 'clientHeight' | 'clientWidth';
  mouseCoord: 'clientX' | 'clientY';
  rectStart: 'top' | 'left';
  rectSize: 'height' | 'width';
  transform: 'translateY' | 'translateX';
  thumbDim: 'height' | 'width';
};

const AXIS: Record<'vertical' | 'horizontal', AxisConfig> = {
  vertical: {
    scrollPos: 'scrollTop',
    scrollSize: 'scrollHeight',
    clientSize: 'clientHeight',
    mouseCoord: 'clientY',
    rectStart: 'top',
    rectSize: 'height',
    transform: 'translateY',
    thumbDim: 'height',
  },
  horizontal: {
    scrollPos: 'scrollLeft',
    scrollSize: 'scrollWidth',
    clientSize: 'clientWidth',
    mouseCoord: 'clientX',
    rectStart: 'left',
    rectSize: 'width',
    transform: 'translateX',
    thumbDim: 'width',
  },
};

const axis = computed(() => AXIS[props.direction ?? 'vertical']);

const MIN_THUMB_SIZE = 54;

const thumbPos = ref(0);
const thumbSize = ref(0);
const hasScroll = ref(false);
const isDragging = ref(false);

let dragStart = 0;
let dragStartScroll = 0;
let scrollResizeObserver: ResizeObserver | null = null;
let trackResizeObserver: ResizeObserver | null = null;

type Metrics = {
  scrollPos: number;
  scrollSize: number;
  clientSize: number;
  trackSize: number;
  maxScroll: number;
};

function getTrackSize(track: HTMLElement | null, element: HTMLElement, config: AxisConfig): number {
  return track?.[config.clientSize] ?? element[config.clientSize];
}

function getMetrics(element: HTMLElement, config: AxisConfig, trackSize: number): Metrics {
  const scrollPos = element[config.scrollPos];
  const scrollSize = element[config.scrollSize];
  const clientSize = element[config.clientSize];

  return { scrollPos, scrollSize, clientSize, trackSize, maxScroll: scrollSize - clientSize };
}

function calcThumbSize(metrics: Metrics): number {
  return Math.max((metrics.clientSize / metrics.scrollSize) * metrics.trackSize, MIN_THUMB_SIZE);
}

function calcThumbPos(scrollPos: number, maxScroll: number, maxThumbPos: number): number {
  return maxScroll > 0 ? (scrollPos / maxScroll) * maxThumbPos : 0;
}

function calcScrollFromThumb(thumbPos: number, maxThumbPos: number, maxScroll: number): number {
  return maxThumbPos > 0 ? (thumbPos / maxThumbPos) * maxScroll : 0;
}

function setHasScroll(value: boolean): void {
  if (hasScroll.value === value) return;
  hasScroll.value = value;
  emit('update:hasScroll', value);
}

function resetThumb(): void {
  thumbPos.value = 0;
  thumbSize.value = 0;
}

function setNoScrollState(): void {
  setHasScroll(false);
  resetThumb();
}

function update(): void {
  const element = props.scrollElement;

  if (!element) {
    setNoScrollState();
    return;
  }

  const config = axis.value;
  const trackSize = getTrackSize(trackRef.value, element, config);
  const metrics = getMetrics(element, config, trackSize);
  const canScroll = metrics.maxScroll > 1;

  setHasScroll(canScroll);

  if (!canScroll) {
    resetThumb();
    return;
  }

  const nextThumbSize = calcThumbSize(metrics);
  const maxThumbPos = trackSize - nextThumbSize;

  thumbSize.value = nextThumbSize;
  thumbPos.value = calcThumbPos(metrics.scrollPos, metrics.maxScroll, maxThumbPos);
}

function addDragListeners(): void {
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
}

function removeDragListeners(): void {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
}

function handleTrackClick(event: MouseEvent): void {
  const element = props.scrollElement;
  const track = trackRef.value;

  if (!element || !track) return;

  const config = axis.value;
  const rect = track.getBoundingClientRect();
  const trackSize = rect[config.rectSize];
  const targetThumbPos = Math.max(
    0,
    Math.min(
      event[config.mouseCoord] - rect[config.rectStart] - thumbSize.value / 2,
      trackSize - thumbSize.value
    )
  );
  const maxThumbPos = trackSize - thumbSize.value;
  const maxScroll = element[config.scrollSize] - element[config.clientSize];

  element[config.scrollPos] = calcScrollFromThumb(targetThumbPos, maxThumbPos, maxScroll);
  update();
}

function handleThumbMouseDown(event: MouseEvent): void {
  const element = props.scrollElement;

  if (!element) return;

  event.preventDefault();
  event.stopPropagation();

  isDragging.value = true;
  dragStart = event[axis.value.mouseCoord];
  dragStartScroll = element[axis.value.scrollPos];

  addDragListeners();
}

function handleMouseMove(event: MouseEvent): void {
  const element = props.scrollElement;

  if (!element || !isDragging.value) return;

  const config = axis.value;
  const trackSize = getTrackSize(trackRef.value, element, config);
  const metrics = getMetrics(element, config, trackSize);
  const maxThumbPos = trackSize - thumbSize.value;

  if (metrics.maxScroll <= 0 || maxThumbPos <= 0) return;

  const delta = event[config.mouseCoord] - dragStart;
  const scrollDelta = calcScrollFromThumb(delta, maxThumbPos, metrics.maxScroll);

  element[config.scrollPos] = dragStartScroll + scrollDelta;
  update();
}

function handleMouseUp(): void {
  if (!isDragging.value) return;
  isDragging.value = false;
  removeDragListeners();
}

function cleanupScrollElement(element: HTMLElement | null): void {
  if (!element) return;
  element.removeEventListener('scroll', update);
  scrollResizeObserver?.disconnect();
  scrollResizeObserver = null;
}

function setupScrollElement(element: HTMLElement): void {
  element.addEventListener('scroll', update);
  scrollResizeObserver = new ResizeObserver(update);
  scrollResizeObserver.observe(element);
  update();
}

function cleanupTrackObserver(): void {
  trackResizeObserver?.disconnect();
  trackResizeObserver = null;
}

function setupTrackObserver(track: HTMLElement): void {
  trackResizeObserver = new ResizeObserver(update);
  trackResizeObserver.observe(track);
  update();
}

watch(
  () => props.scrollElement,
  (newElement, oldElement) => {
    cleanupScrollElement(oldElement ?? null);
    if (newElement) setupScrollElement(newElement);
    else setNoScrollState();
  },
  { immediate: true }
);

watch(trackRef, (newTrack, oldTrack) => {
  if (oldTrack) cleanupTrackObserver();
  if (newTrack) setupTrackObserver(newTrack);
});

onBeforeUnmount(() => {
  cleanupScrollElement(props.scrollElement);
  cleanupTrackObserver();
  removeDragListeners();
});
</script>

<template>
  <div
    v-if="hasScroll"
    ref="trackRef"
    class="custom-scrollbar"
    :class="`custom-scrollbar--${direction ?? 'vertical'}`"
    @click="handleTrackClick"
  >
    <div
      class="custom-scrollbar__thumb"
      :class="{ 'custom-scrollbar__thumb--dragging': isDragging }"
      :style="{ [axis.thumbDim]: `${thumbSize}px`, transform: `${axis.transform}(${thumbPos}px)` }"
      @mousedown="handleThumbMouseDown"
    />
  </div>
</template>

<style scoped lang="scss">
.custom-scrollbar {
  position: relative;
  background: var(--color-scrollbar-track);
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;

  &--vertical {
    width: var(--scrollbar-width);
    margin-right: var(--scrollbar-gap-right);

    .custom-scrollbar__thumb {
      width: 100%;
    }
  }

  &--horizontal {
    height: var(--scrollbar-width);
    margin-block: var(--scrollbar-gap);

    .custom-scrollbar__thumb {
      height: 100%;
    }
  }

  &__thumb {
    position: absolute;
    top: 0;
    left: 0;
    background: var(--color-scrollbar-thumb);
    cursor: pointer;
    transition: background-color 0.15s;

    &:hover,
    &--dragging {
      background: var(--color-scrollbar-thumb-hover);
    }
  }
}
</style>
