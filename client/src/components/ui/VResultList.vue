<script setup>
import { useLocaleDate } from "@/composables/use-formats"
defineProps({
  results: {
    type: Array,
    default: []
  },
  display: {
    type: String,
    default: "grid"
  },
  routeName: {
    type: String,
    default: "staff-result"
  }
});
</script>

<template>
  <section>
    <div v-if="results.length">
      <div v-if="display === 'grid'" class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(135px,1fr))]">
        <RouterLink v-for="result in results" :key="result._id" :title="result.courseTitle"
          :to="{ name: routeName, params: { resultId: result._id } }"
          class="group hover:bg-slate-200 p-2 rounded-md transition-colors">
          <div
            class="border bg-white shadow-sm rounded-md p-2 pb-3 flex flex-col items-center justify-center gap-1 text-white">
            <div class="text-center">
              <p class="font-semibold text-lg text-red-400">{{ result.courseCode.split("-").join(" ") }}</p>
              <p class="text-sm font-medium text-slate-500">{{ result.session }}</p>
            </div>
            <VIcon icon="pdf" width="90" height="90" />
          </div>

          <div class="text-sm text-slate-700 text-center mt-3">
            <p class="group-hover:text-blue-600 group-hover:underline truncate text-medium">
              {{ result.courseTitle }}
            </p>
            <p class="text-[0.8rem]">
              {{ useLocaleDate(result.createdAt, { format: "dd-MM-yyyy", separator: "-", useAbbreviations: true }) }}
            </p>
          </div>
        </RouterLink>
      </div>

      <div v-if="display === 'list'" class="h-full">
        <table class="table-auto w-full whitespace-nowrap md:whitespace-normal">
          <thead class="text-left sticky top-0 bg-slate-100">
            <tr class="*:p-1">
              <th></th>
              <th>Course Code</th>
              <th>Session</th>
              <th>Course Title</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>

            <tr v-for="result in results" :key="result._id" :title="result.courseTitle"
              @click="$router.push({ name: routeName, params: { resultId: result._id } })"
              class="group border-b *:p-2 hover:bg-slate-200 transition-colors cursor-pointer ">
              <td class="w-5">
                <VIcon icon="pdf" />
              </td>
              <td class="w-36 group-hover:text-blue-500">{{ result.courseCode.split("-").join(" ") }}</td>
              <td class="w-36">{{ result.session }}</td>
              <td>{{ result.courseTitle }}</td>
              <td>
                {{ useLocaleDate(result.createdAt, { format: "dd-MM-yyyy", separator: "-", useAbbreviations: true }) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="grid place-content-center h-96">
      <div class="p-2 opacity-80">
        <VIcon icon="pdf" width="150" height="150" />
      </div>
      <p class="text-slate-500 text-lg text-center font-medium">No Results</p>
    </div>
  </section>
</template>