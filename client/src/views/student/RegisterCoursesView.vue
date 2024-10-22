<script setup>
import { computed, ref } from "vue";
import sessions from "../../data/sessions";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import useFetch from "@/composables/fetch/use-fetch";
import InputGroupAddon from "primevue/inputgroupaddon";

const router = useRouter();
const toast = useToast();
const { error, data } = await useFetch("student/courses", { router, toast, cache: true })

const courseReg = ref({
  semester: "",
  level: ""
});

const filteredCourses = computed(() => {
  if (data) {
    return data.value.courses.filter(course => {
      return course.semester.toLowerCase().includes(courseReg.value.semester.toLowerCase()) &&
        course.level === courseReg.value.level
    })
  }
  return []
})

const selectedCourses = computed(() => {
  if (data) {
    return data.value.courses.filter((course) => course.isSelected)
  }
  return [];
});

const loading = ref(false);
const err = ref(null);
const handleSubmit = async () => {
  if (!selectedCourses.value.length > 0) {
    toast.add({ summary: "No courses selected!", life: 5000 })
    return;
  }
  courseReg.value.courses = selectedCourses.value;
  loading.value = true;
  error.value = null;
  const { error: e } = await useFetch(
    "student/register-courses",
    { router, toast, body: courseReg.value, method: "POST" },
    () => {
      router.push({ name: "course-registration" })
    }
  );
  loading.value = false;
  err.value = e.value;
}
</script>

<template>
  <section class="h-full overflow-y-auto">
    <header class="bg-white border-y px-5 py-2">
      <div class="flex items-center justify-between gap-3 mb-2">
        <p class="font-semibold">Register Courses</p>

        <Button @click="handleSubmit" label="Register" icon="pi pi-check" :loading
          :disabled="!courseReg.session || !courseReg.semester || !selectedCourses.length > 0 || loading" />
      </div>
      <div class="flex justify-between items-center w-full flex-wrap">
        <p>Selected Courses: <span class="font-semibold"> {{ selectedCourses.length }}</span></p>
        <InputGroup class="w-full md:w-fit">
          <Select v-model="courseReg.session" placeholder="Session" :options="sessions" class="md:w-40" />
          <Select v-model="courseReg.semester" placeholder="Semester" :options="['HARMATTAN', 'RAIN']"
            class="md:w-44" />
          <Select v-model="courseReg.level" placeholder="Level" :options="[100, 200, 300, 400, 500, 600, 700]"
            class="md:w-28" />
            <InputGroupAddon>
              <span class="pi pi-search"></span>
            </InputGroupAddon>
          <!-- <Button size="small" severity="secondary" icon="pi pi-search" /> -->
        </InputGroup>
      </div>
      <div class="w-full flex justify-end mt-1">
        <small v-if="err" class="text-red-500">{{ err.message }}</small>
      </div>
    </header>

    <div class="max-h-[calc(100%-4rem)] overflow-y-auto">
      <section v-if="error" class="h-72 px-2 pb-5 md:px-5 grid w-full place-content-center">
        <ServerError :error reloadOnRetry />
      </section>

      <section v-else-if="data" class="h-full px-2 pb-5 md:px-5 grid gap-4">
        <div v-show="courseReg.session" class="w-full overflow-auto">
          <table class="table-auto w-full whitespace-nowrap md:whitespace-normal">
            <thead class="text-left sticky top-0 bg-slate-100">
              <tr class="*:p-1">
                <th></th>
                <th>Course Code</th>
                <th>Course Title</th>
              </tr>
            </thead>
            <tbody>

              <tr v-for="course in filteredCourses" :key="course.code"
                class="group border-b *:p-2 hover:bg-slate-200 transition-colors cursor-pointer"
                :class="{ 'bg-slate-200' : course.isSelected }">
                <td>
                  <Checkbox v-model="course.isSelected" :binary="true" />
                </td>
                <td class="w-36">{{ course.code.split("-").join(" ") }}</td>
                <td>{{ course.title }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

  </section>
</template>