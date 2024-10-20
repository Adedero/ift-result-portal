<script setup>
import { computed } from "vue";

const props = defineProps({
  user: {
    type: [null, Object],
    default: {}
  },
  addDetails: {
    type: Boolean,
    default: false
  },
  shape: {
    type: String,
    default: "circle"
  },
  size: {
    type: String,
    default: "large"
  },
  class: {
    type: String,
  },
  style: {
    type: String
  },
  height: {
    type: String,
    default: "45"
  },
  width: {
    type: String,
    default: "45"
  }
});

const isUserValid = computed(() => props.user ? Object.keys(props.user).length > 0 : false)
</script>
<template>
  <div>
    <div v-if="isUserValid" :class="{ 'flex items-center gap-2': addDetails }">
      <div v-if="addDetails" class="hidden md:block text-xs text-right text-slate-600">
        <p class="font-semibold">{{ user.firstName }} {{ user.lastName }}</p>
        <p>{{  user.email || user.username || user.staffId || user.regNumber }}</p>
      </div>
      <div v-if="user.image" class="overflow-hidden rounded-full" :class :style>
        <img :src="user.image" class="w-full h-full object-cover">
      </div>
      <Avatar v-else :label="user.firstName.split('')[0]" :class :style :shape :size />
    </div>
    <div v-else class="text-[--p-primary-500]" :class>
      <VIcon icon="user" :height :width />
    </div>
  </div>
</template>