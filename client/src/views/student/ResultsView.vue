<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import useFetch from "@/composables/fetch/use-fetch";

const router = useRouter();
const toast = useToast();
const { error, data } = await useFetch('student/results', { router, toast, cache: true });
const search = ref("");
const display = ref("grid");
const routeName = "student-result";

const filteredResults = computed(() => {
  if (data.value) {
    const filtered = {};

    for (const [session, resultsArray] of Object.entries(data.value.results)) {
      const matchedResults = resultsArray
        .map(result => ({ ...result, courseCode: result.courseCode.split("-").join(" ") }))
        .filter(result =>
          result.courseCode.toLowerCase().includes(search.value.toLowerCase()) ||
          result.courseTitle.toLowerCase().includes(search.value.toLowerCase())
        );

      if (matchedResults.length > 0) {
        filtered[session] = matchedResults;
      }
    }

    return filtered;
  }
  return {}
})

</script>

<template>
  <section class="h-full overflow-y-auto">
    <header class="bg-white border-y px-5 py-2 flex items-center gap-2 justify-between flex-wrap">
      <div class="flex items-center gap-3 justify-between">
        <p class="font-semibold">Results</p>
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="search" placeholder="Search" fluid class="h-8 text-sm" />
        </IconField>
      </div>

      <div class="flex items-center gap-2">
        <Button @click="display = 'grid'" size="small" icon="pi pi-table" severity="secondary"
          :outlined="display !== 'grid'" />
        <Button @click="display = 'list'" size="small" icon="pi pi-list" severity="secondary"
          :outlined="display === 'grid'" />
      </div>
    </header>

    <div class="max-h-[calc(100%-4rem)] overflow-y-auto">
      <section v-if="error" class="h-72 px-2 pb-5 md:px-5 grid w-full place-content-center">
        <ServerError reloadOnRetry />
      </section>

      <section v-else-if="data" class="h-full px-2 pb-5 md:px-5 grid gap-4">
        <div v-for="(resultsArray, key) in filteredResults" :key="key" class="pt-5">
          <h1 class="font-semibold text-lg">{{ key }}</h1>
          <VStudentResultList :display :results="resultsArray" :routeName />
          <Divider />
        </div>

        <div v-if="!Object.keys(filteredResults).length" class="grid place-content-center h-96">
          <div class="p-2 opacity-80">
            <VIcon icon="pdf" width="150" height="150" />
          </div>
          <p class="text-slate-500 text-lg text-center font-medium">No Results</p>
        </div>
      </section>
    </div>

  </section>
</template>