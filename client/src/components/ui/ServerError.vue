<script setup>
const props = defineProps({
  error: {
    type: [Error, Object],
  },
  useErrorObject: {
    type: Boolean,
    default: true,
  },
  errorMessage: {
    type: String,
    default: 'Something went wrong. \n Check your connection and try again.',
  },
  reloadOnRetry: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: 'no-wifi',
  }
});

const emit = defineEmits(["retry"]);

const handleRetry = () => {
  emit("retry")
  if (props.reloadOnRetry) {
    window.location.reload();
    return;
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center whitespace-pre-wrap text-center text-sm">
    <slot name="icon">
      <VIcon :icon width="80" height="80" />
    </slot>
    <div class="font-medium">
      <div v-if="useErrorObject && error">
        {{ error.message }}
      </div>
      <div v-else>
        {{ errorMessage }}
      </div>
    </div>
    <slot name="cta">
      <Button @click="handleRetry" label="Retry" icon="pi pi-refresh" class="mt-2" />
    </slot>
  </div>
</template>