<script setup>
import { ref } from "vue";
const props = defineProps({
  color: {
    type: String,
    default: 'bg-[--p-primary-500]'
  },
  title: {
    type: String,
  },
  value: {
    type: [String, Number]
  },
  icon: {
    type: String
  },
  iconStyle: {
    type: String
  }
});

const iconColor = ref(props.color.replace("bg", "text"));
</script>
<template>
  <div class="flex overflow-hidden bg-white rounded-md shadow-sm min-h-24">
    <div :class="['w-2.5', color]"></div>
    <div class="flex items-end justify-between gap-2 py-2 px-4 flex-grow">
      <div :class="iconColor">
        <slot name="icon">
          <span :class="icon" :style="iconStyle"></span>
        </slot>
      </div>
      <div class="text-right">
        <p class="text-[0.78rem] uppercase text-slate-500">{{ title }}</p>
        <h1 class="font-bold text-4xl">{{ value }}</h1>
      </div>
    </div>
  </div>
</template>