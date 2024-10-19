<script setup>
import { defineAsyncComponent, ref } from "vue";
const FaceDetector = defineAsyncComponent({
  loader: () => import("./FaceDetector.vue"),
});
const visible = ref(false);
const open = () => visible.value = true;
</script>

<template>
  <div>
    <slot name="open-button" :open>
      <button @click="open" type="button">Open</button>
    </slot>

    <Dialog v-model:visible="visible" modal header="Face ID">
      <Suspense>
        <template #default>
          <FaceDetector v-if="visible" />
        </template>
        <template #fallback>
          <div class="w-60 aspect-square flex items-center justify-center">
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
              animationDuration=".5s" aria-label="Custom ProgressSpinner" />
          </div>
        </template>
      </Suspense>
    </Dialog>
  </div>
</template>