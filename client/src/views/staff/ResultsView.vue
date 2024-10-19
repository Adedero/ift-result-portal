<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import useFetch from "@/composables/fetch/use-fetch";

const router = useRouter();
const toast = useToast();
const { error, data } = await useFetch('staff/results', { router, toast, cache: true });
const search = ref("");
const display = ref("grid");
const routeName = "staff-result"

const filteredResults = computed(() => {
  if (data) {
    return data.value.results.filter(result => {
      return (
        result.courseCode.toLowerCase().includes(search.value.toLowerCase()) ||
        result.courseTitle.toLowerCase().includes(search.value.toLowerCase())
      )
    });
  }
  return []
});

const formattedCourses = data.value.courses.map(course => ({ code: course.code.split("-").join(" "), title: course.title }));

const handlResultUpload = (result) => {
  data.value.results = data.value.results.filter(r => {
    return (
      r.courseCode !== result.courseCode &&
      r.semester !== result.semester &&
      r.session !== result.session
    )
  })
  data.value.results.unshift(result);
}
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
        <VResultUploader :courses="formattedCourses" @upload="handlResultUpload" />
      </div>
    </header>

    <div class="max-h-[calc(100%-4rem)] overflow-y-auto">
      <section v-if="error" class="h-72 px-2 pb-5 md:px-5 grid w-full place-content-center">
        <ServerError />
      </section>

      <section v-else-if="data" class="h-full px-2 pb-5 md:px-5 grid gap-4">
        <VResultList :display :results="filteredResults" :routeName />
      </section>
    </div>

  </section>
</template>