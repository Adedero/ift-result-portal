<script setup>
import { ref } from "vue";
defineProps({
  message: {
    type: String,
    default: "Take a moment to set up your email address."
  }
});

const visible = ref(true);
</script>
<template>
  <div
    class="message bg-blue-50 px-2 py-3 border-2 border-blue-300 text-blue-500 rounded-md w-full flex flex-col items-center justify-center gap-3 overflow-hidden transition-all text-sm"
    :class="{ 'hidden' : !visible }">

    <p class="font-medium">{{ message }}</p>

    <div class="flex items-center gap-2 justify-center">
      <RouterLink :to="{ name: 'email-setup' }"
        class="flex items-center gap-2 font-medium border border-transparent bg-blue-400 text-white hover:bg-blue-500 p-2 rounded transition-colors">
        <span>Okay</span>
        <span class="pi pi-external-link"></span>
      </RouterLink>

      <button @click="visible = false" type="button" class="flex items-center gap-2 font-medium p-2 rounded border border-blue-400 transition-colors hover:bg-blue-100">
        <span>Later</span>
        <span class="pi pi-times"></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.message {
  transition-property: allow-discrete;
}
</style>