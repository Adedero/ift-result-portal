<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import useFetch from "@/composables/fetch/use-fetch";
import { VuePDF, usePDF } from '@tato30/vue-pdf'



const route = useRoute();
const router = useRouter();
const toast = useToast();

const { error, data } = await useFetch(`${route.meta.userRole}/result/${route.params.resultId}`, { router, toast, cache: true });
const { pdf, pages } = usePDF(data.value.result.url);
const scale = ref(1)
//const page = ref(1);

const handleScale = (value) => {
  if (value === 1) {
    if (scale.value === 1.5) return;
    scale.value = scale.value < 2 ? scale.value + 0.25 : scale.value
  }
  if (value === -1) {
    scale.value = scale.value > 0.25 ? scale.value - 0.25 : scale.value
  }
}
</script>

<template>
  <section class="h-full">
    <div v-if="error">
      <ServerError :error reload-on-retry />
    </div>
    <div v-if="data" class="h-full">
      <header class="bg-white border-y px-5 py-2 flex items-center gap-3 justify-between flex-wrap">
        <div class="flex items-center gap-2">
          <Button @click="$router.back()" size="small" icon="pi pi-angle-left" label="Results" severity="secondary" />
          <p class="font-semibold">{{ data.result.courseCode.split("-").join(" ") }} Result</p>
        </div>

        <div class="flex items-center gap-2 text-sm bg-slate-100">
          <Button icon="pi pi-minus" size="small" @click="handleScale(-1)" :disabled="scale <= 0.25" />
          <span class="font-medium select-none cursor-context-menu">{{ scale * 100 }}%</span>
          <Button icon="pi pi-plus" size="small" @click="handleScale(1)" :disabled="scale >= 1.5"></Button>
        </div>

        <div class="flex items-center gap-2 ml-auto md:ml-0">
          <a :href="data.result.url" :download="data.result.name">
            <Button size="small" label="Download" icon="pi pi-download" />
          </a>
          <Button v-if="$route.meta.userRole === 'admin'" label="Delete" severity="danger" size="small"
            icon="pi pi-trash" outlined />
        </div>
      </header>
      <div class="h-[calc(100%-4rem)] w-full overflow-auto flex flex-col items-center gap-4">
        <div v-for="page in pages" class="w-full md:w-fit">
          <VuePDF :page :pdf="pdf" :scale>
            <div class="h-96 w-full flex items-center justify-center">
              <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
                animationDuration=".5s" aria-label="Custom ProgressSpinner" />
            </div>
          </VuePDF>

        </div>
      </div>
    </div>
  </section>
</template>