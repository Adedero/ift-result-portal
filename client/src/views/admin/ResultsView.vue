<script setup>
import { computed, ref, watch, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import useFetch from "@/composables/fetch/use-fetch";
import { useConfirm } from "primevue/useconfirm";
import { useLocaleDate } from "@/composables/use-formats"


const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const LIMIT = 50;
const page = ref(0);
const [
  { error, data },
  { data: courses },
  { data: count }
] = await Promise.all([
  useFetch(`admin/results?page=${page.value}&limit=${LIMIT}`, { router, toast, cache: true }),
  useFetch(
    "admin/courses",
    { router, toast, cache: true, toastOnFailure: true, failureDetail: 'Could not get courses. Try again later' },
    (payload) => payload.forEach(r => r.checked = true)
  ),
  useFetch("admin/result-count", { router, toast, cache: true })
])

watch(page, async (value) => {
  data.value = await useFetch(`admin/results?page=${value}&limit=${LIMIT}`, { router, toast, cache: true }).data.value
})
const search = ref("");
const routeName = "admin-result"

const filteredResults = computed(() => {
  if (data.value) {
    return data.value.results
      .map(result => ({ ...result, courseCode: result.courseCode.split("-").join(" ") }))
      .filter(result => (
        result.courseCode.toLowerCase().includes(search.value.toLowerCase()) ||
        result.courseTitle.toLowerCase().includes(search.value.toLowerCase())
      )
      );
  }
  return []
});

const formattedCourses = courses.value.map(course => ({ code: course.code.split("-").join(" "), title: course.title }));

const handleResultUpload = (result) => {
  const filteredResults = data.value.results.filter(r => {
    return (
      r.courseCode !== result.courseCode ||
      r.semester !== result.semester ||
      r.session !== result.session
    );
  });

  filteredResults.unshift(result);
  data.value.results = filteredResults;
};

const updateResult = (result) => {
  const updatedResults = data.value.results.map(r => {
    if (r._id === result._id) {
      return result;
    }
    return r;
  });
  data.value.results = updatedResults;
}

const areAnyResultsSelected = computed(() => data.value.results.some(result => result.checked));
const allSelected = ref(false);

watch(allSelected, (value) => {
  if (value) {
    data.value.results.forEach(result => result.checked = true)
  } else {
    data.value.results.forEach(result => result.checked = false)
  }
});

const selectedResults = computed(() => data.value.results.filter(result => result.checked))

const isDeleting = ref(false);
const deleteResults = async () => {
  isDeleting.value = true;
  await useFetch(
    "admin/delete-results",
    { method: "POST", router, toast, toastOnFailure: true, toastLife: 8000, body: selectedResults.value },
    (payload) => {
      const removedResultsIds = selectedResults.value.map(result => result._id);
      if (payload.results) {
        data.value.results = [
          ...data.value.results.filter(result => !removedResultsIds.includes(result._id)),
          ...payload.results
        ];
      }
    }
  )
  isDeleting.value = false;
}

const confirmDelete = () => {
  confirm.require({
    message: `Are you sure you want to delete ${selectedResults.value.length} ${selectedResults.value.length === 1 ? 'result' : 'results'}?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger'
    },
    accept: () => {
      deleteResults()
    }
  })
}


const totalPages = computed(() => Math.ceil(count.value.count / LIMIT))

const lowerBound = computed(() => page.value * LIMIT + 1)
const upperBound = computed(() => Math.min((page.value + 1) * LIMIT, count.value.count))
</script>

<template>
  <section class="h-full overflow-y-auto">
    <header class="bg-white border-y px-5 py-2 flex items-center gap-2 justify-between flex-wrap">
      <div class="flex items-center gap-3 justify-between">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1 transition-all">
            <CheckBox v-model="allSelected" :binary="true" />
            <Button @click="confirmDelete" v-show="areAnyResultsSelected" size="small" icon="pi pi-trash"
              severity="danger" text :loading="isDeleting" />
          </div>
          <p class="font-semibold">
            {{ selectedResults.length ? `${selectedResults.length}/` : ""}}{{ filteredResults.length }}
          </p>
          <p class="font-semibold">Results</p>
        </div>

        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="search" placeholder="Search" fluid class="h-8 text-sm" />
        </IconField>
      </div>

      <div>
        <Button @click="page--" text severity="secondary" size="small" rounded icon="pi pi-chevron-left" :disabled="page < 1" />
        <span class="text-sm">{{ lowerBound }} - {{ upperBound }} of {{ count.count }}</span>
        <Button @click="page++" text severity="secondary" size="small" rounded icon="pi pi-chevron-right"
          :disabled="page + 1 === totalPages" />
      </div>

      <VResultUploader uploader="admin" :courses="formattedCourses" @upload="handleResultUpload" />
    </header>

    <div class="max-h-[calc(100%-4rem)] overflow-y-auto">
      <section v-if="error" class="h-72 px-2 pb-5 md:px-5 grid w-full place-content-center">
        <ServerError />
      </section>

      <section v-else-if="data" class="h-full px-2 pb-5 md:px-5 grid gap-4">
        <div class="h-full">
          <table class="table-auto w-full whitespace-nowrap md:whitespace-normal">
            <thead class="text-left sticky top-0 bg-slate-100">
              <tr class="*:p-1">
                <th></th>
                <th></th>
                <th>Course Code</th>
                <th>Session</th>
                <th>Course Title</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>

              <tr v-for="result in filteredResults" :key="result._id" :title="result.courseTitle"
                class="group border-b *:p-2 hover:bg-slate-200 transition-colors duration-100 cursor-pointer"
                :class="{ 'bg-slate-200': result.checked }">
                <td>
                  <Checkbox v-model="result.checked" @click="updateResult(result)" :binary="true" />
                </td>
                <td class="w-5" @click="$router.push({ name: routeName, params: { resultId: result._id } })">
                  <VIcon icon="pdf" />
                </td>
                <td class="w-36 group-hover:text-blue-500"
                  @click="$router.push({ name: routeName, params: { resultId: result._id } })">
                  {{ result.courseCode.split("-").join(" ") }}
                </td>
                <td class="w-36" @click="$router.push({ name: routeName, params: { resultId: result._id } })">
                  {{ result.session }}
                </td>
                <td>{{ result.courseTitle }}</td>
                <td @click="$router.push({ name: routeName, params: { resultId: result._id } })">
                  {{ useLocaleDate(result.createdAt, { format: "dd-MM-yyyy", separator: "-", useAbbreviations: true })
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

  </section>
</template>