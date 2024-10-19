<script setup>
import { ref } from 'vue';
import useFetch from '../../composables/fetch/use-fetch';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useLocaleDate } from "@/composables/use-formats"

const router = useRouter();
const toast = useToast();

const { data, error } = await useFetch("admin/dashboard", { router, toast, cache: true });
</script>

<template>
  <section class="max-h-full grid gap-4 overflow-y-auto">
    <header class="bg-white border-y px-5 py-2">
      <p class="font-semibold">Dashboard</p>
    </header>

    <section v-if="error" class="h-72 px-2 pb-5 md:px-5 grid w-full place-content-center">
      <ServerError reloadOnRetry />
    </section>

    <section v-else-if="data" class="px-2 pb-5 md:px-5 grid gap-4">
      <div class="grid gap-4 md:grid-cols-4">
        <VDashboardCard title="admins" :value="data.admins || 0" icon="pi pi-users" icon-style="font-size: 2.8rem" />
        <VDashboardCard title="staffs" :value="data.staffs || 0" icon="pi pi-briefcase" icon-style="font-size: 2.8rem"
          color="bg-purple-500" />
        <VDashboardCard title="students" :value="data.students || 0" icon="pi pi-users" icon-style="font-size: 2.8rem"
          color="bg-rose-500" />
        <VDashboardCard title="results" :value="data.results || 0" icon="pi pi-book" icon-style="font-size: 2.8rem"
          color="bg-amber-500" />
      </div>

      <div class="bg-white border-y p-5 rounded-md grid gap-2">
        <h3 class="font-semibold">Generate Registration PIN</h3>
        <VPinGenerator />
      </div>

      <div class="bg-white border-y px-5 py-2 rounded-md">
        <h3 class="font-semibold">Recent Results</h3>
        <div v-if="data.recentResults.length">
          <DataTable :value="data.recentResults">
            <Column field="courseCode" header="Course Code">
              <template #body="slotProps">
                <p>
                  {{ slotProps.data.courseCode.split("-").join(" ") }}
                </p>
              </template>
            </Column>
            <Column field="staff" header="Staff">
              <template #body="slotProps">
                <p>
                  {{ slotProps.data.staff.firstName }} {{ slotProps.data.staff.lastName }}
                </p>
              </template>
            </Column>
            <Column field="createdAt" header="Date">
              <template #body="slotProps">
                <p>
                  {{ useLocaleDate(slotProps.data.createdAt) }}
                </p>
              </template>
            </Column>

          </DataTable>
        </div>

        <div v-else class="flex flex-col gap-3 p-5 items-center justify-center select-none cursor-context-menu">
          <div class="opacity-80">
            <VIcon icon="doc" height="150" width="150" />
          </div>
          <p class="font-medium text-slate-500 text-xl">No recent results</p>
        </div>
      </div>
    </section>

  </section>
</template>