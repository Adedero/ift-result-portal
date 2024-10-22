<script setup>
import { ref, watch } from "vue";
import useFetch from "../../composables/fetch/use-fetch";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

const router = useRouter();
const toast = useToast();

const props = defineProps({
  updatedCourse: { type: Object }
})
const emit = defineEmits(["update-course"])

const course = ref(props.updatedCourse ? { ...props.updatedCourse } : {});

const loading = ref(false)
const submitForm = async () => {
  loading.value = true;
  await useFetch(
    `admin/course/${course.value._id}`,
    { router, toast, method: "PUT", body: { course: course.value }, toastOnFailure: true, toastLife: 5000 },
    (payload) => {
      emit("update-course", payload.course)
    }
  );
  loading.value = false;
}

watch(
  () => course.value.code,
  (value) => {
    if (value && value.length > 4 && value.includes("-") ) {
      const courseCodeNumber = value.split("-")[1];
      const num = parseInt(courseCodeNumber, 10);
      if (!isNaN(num)) {
        course.value.semester = (num % 2 === 0) ? "RAIN" : "HARMATTAN";
        course.value.level = Math.floor(num / 100) * 100;
      }
    } else {
      course.value.semester = null;
      course.value.level = null;
    }
  }
)
</script>

<template>
  <div class="min-w-[min(70dvw,20rem)] md:w-[30rem] lg:w-[36rem]">
    <p class="text-sm text-red-500">* Required</p>
    <div class="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
      <div class="grid">
        <label for="course-code" class="text-sm text-slate-600 font-medium">Course Code
          <span class="text-red-500">*</span>
        </label>
        <InputMask v-model="course.code" mask="aaa-999" fluid input-id="course-code" />
      </div>

      <div class="grid md:col-span-2 lg:col-span-3 md:order-3 lg:order-4">
        <label for="course-title" class="text-sm text-slate-600 font-medium">Course Title
          <span class="text-red-500">*</span>
        </label>
        <InputText v-model.trim="course.title" id="course-title" type="text" fluid />
      </div>

      <div class="grid">
        <label for="semester" class="text-sm text-slate-600 font-medium">Semester
        </label>
        <Select v-model="course.semester" :options="['HARMATTAN', 'RAIN']" fluid input-id="semester" />
      </div>


      <div class="grid md:order-4 lg:order-3">
        <label for="level" class="text-sm text-slate-600 font-medium">Level
        </label>
        <Select v-model="course.level" :options="[100, 200, 300, 400, 500, 600, 700]" fluid input-id="level" />
      </div>

      <div class="flex items-end md:order-5">
        <Button label="Submit" icon="pi pi-plus"
          :disabled="loading || !course.code || !course.title" @click="submitForm" :loading
          fluid />
      </div>
    </div>
  </div>
</template>