<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const trackRef = ref<HTMLElement | null>(null)

const props = defineProps<{
  scrollElement: HTMLElement | null
}>()

const emit = defineEmits<{
  'update:hasScroll': [value: boolean]
}>()

const MIN_THUMB_HEIGHT = 54

const thumbTop = ref(0)
const thumbHeight = ref(0)
const hasScroll = ref(false)
const isDragging = ref(false)

let dragStartY = 0
let dragStartScrollTop = 0
let scrollResizeObserver: ResizeObserver | null = null
let trackResizeObserver: ResizeObserver | null = null

function setHasScroll(value: boolean): void {
  if (hasScroll.value === value) {
    return
  }

  hasScroll.value = value
  emit('update:hasScroll', value)
}

function resetThumb(): void {
  thumbTop.value = 0
  thumbHeight.value = 0
}

function setNoScrollState(): void {
  setHasScroll(false)
  resetThumb()
}

function getTrackHeight(element: HTMLElement): number {
  return trackRef.value?.clientHeight ?? element.clientHeight
}

function update(): void {
  const element = props.scrollElement

  if (!element) {
    setNoScrollState()
    return
  }

  const { scrollTop, scrollHeight, clientHeight } = element
  const canScroll = scrollHeight > clientHeight + 1

  setHasScroll(canScroll)

  if (!canScroll) {
    resetThumb()
    return
  }

  const trackHeight = getTrackHeight(element)
  const nextThumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, MIN_THUMB_HEIGHT)
  const maxThumbTop = trackHeight - nextThumbHeight
  const maxScrollTop = scrollHeight - clientHeight

  thumbHeight.value = nextThumbHeight
  thumbTop.value = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0
}

function addDragListeners(): void {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}

function removeDragListeners(): void {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
}

function handleTrackClick(event: MouseEvent): void {
  const element = props.scrollElement
  const track = trackRef.value

  if (!element || !track) {
    return
  }

  const rect = track.getBoundingClientRect()
  const targetTop = Math.max(
    0,
    Math.min(event.clientY - rect.top - thumbHeight.value / 2, rect.height - thumbHeight.value),
  )
  const maxThumbTop = rect.height - thumbHeight.value
  const maxScrollTop = element.scrollHeight - element.clientHeight

  element.scrollTop = maxThumbTop > 0 ? (targetTop / maxThumbTop) * maxScrollTop : 0
  update()
}

function handleThumbMouseDown(event: MouseEvent): void {
  const element = props.scrollElement

  if (!element) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  isDragging.value = true
  dragStartY = event.clientY
  dragStartScrollTop = element.scrollTop

  addDragListeners()
}

function handleMouseMove(event: MouseEvent): void {
  const element = props.scrollElement

  if (!element || !isDragging.value) {
    return
  }

  const maxScrollTop = element.scrollHeight - element.clientHeight
  const maxThumbTop = getTrackHeight(element) - thumbHeight.value

  if (maxScrollTop <= 0 || maxThumbTop <= 0) {
    return
  }

  const deltaY = event.clientY - dragStartY
  const scrollDelta = (deltaY / maxThumbTop) * maxScrollTop

  element.scrollTop = dragStartScrollTop + scrollDelta
  update()
}

function handleMouseUp(): void {
  if (!isDragging.value) {
    return
  }

  isDragging.value = false
  removeDragListeners()
}

watch(
  () => props.scrollElement,
  (newElement, oldElement) => {
    if (oldElement) {
      oldElement.removeEventListener('scroll', update)
      scrollResizeObserver?.disconnect()
      scrollResizeObserver = null
    }

    if (!newElement) {
      setNoScrollState()
      return
    }

    newElement.addEventListener('scroll', update)

    scrollResizeObserver = new ResizeObserver(update)
    scrollResizeObserver.observe(newElement)

    update()
  },
  { immediate: true },
)

watch(trackRef, (newTrack, oldTrack) => {
  if (oldTrack) {
    trackResizeObserver?.disconnect()
    trackResizeObserver = null
  }

  if (newTrack) {
    trackResizeObserver = new ResizeObserver(update)
    trackResizeObserver.observe(newTrack)
    update()
  }
})

onBeforeUnmount(() => {
  props.scrollElement?.removeEventListener('scroll', update)
  scrollResizeObserver?.disconnect()
  trackResizeObserver?.disconnect()
  removeDragListeners()
})

defineExpose({ update })
</script>

<template>
  <div
    v-if="hasScroll"
    ref="trackRef"
    class="custom-scrollbar"
    @click="handleTrackClick"
  >
    <div
      class="custom-scrollbar__thumb"
      :class="{ 'custom-scrollbar__thumb--dragging': isDragging }"
      :style="{
        height: `${thumbHeight}px`,
        transform: `translateY(${thumbTop}px)`,
      }"
      @mousedown="handleThumbMouseDown"
    />
  </div>
</template>

<style scoped lang="scss">
.custom-scrollbar {
  position: relative;
  width: $scrollbar-width;
  margin-right: $scrollbar-gap-right;
  background: #8f8f8f;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;

  &__thumb {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background: $color-text;
    cursor: pointer;
    transition: background-color 0.15s;

    &:hover,
    &--dragging {
      background: #111;
    }
  }
}
</style>
