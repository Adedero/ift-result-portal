<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import useFetch from '../../composables/fetch/use-fetch';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';


const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const loading = ref(false);
const error = ref(null);
const courses = ref(null);


const getCourses = async () => {
  loading.value = true;
  error.value = null;
  const { cache, error: err } = await useFetch(`admin/courses`,
    { router, toast, cache: true },
  )
  if (cache.value) {
    courses.value = cache.value;
  }
  loading.value = false;
  error.value = err.value;
}

const search = ref("");
const filteredCourses = computed(() => {
  if (courses.value) {
    return courses.value
      .filter(course => (
        (course.code.toLowerCase().split("-").join(" ").includes(search.value.toLowerCase())) ||
        (course.title.toLowerCase().includes(search.value.toLowerCase())) ||
        (course.semester.toLowerCase().includes(search.value.toLowerCase())) ||
        (course.level == search.value)
      )
    );
  }
  return []
});


//Adding a new course
const visible = ref(false);
const handleCourseAdd = (newCourse) => {
  if (courses.value) {
    courses.value.unshift(newCourse);
    visible.value = false;
  }
}

//Selecting courses
const areAnyCoursesSelected = computed(() => courses.value ? courses.value.some(course => course.checked) : false);
const allSelected = ref(false);

watch(allSelected, (value) => {
  if (value) {
    courses.value.forEach(course => course.checked = true)
  } else {
    courses.value.forEach(course => course.checked = false)
  }
});

const selectedCourses = computed(() => courses.value ? courses.value.filter(course => course.checked) : []);

//Deleting courses
const isDeleting = ref(false);
const deleteCourses = async () => {
  isDeleting.value = true;
  await useFetch(
    "admin/delete-courses",
    { method: "POST", router, toast, toastOnFailure: true, toastLife: 8000, body: selectedCourses.value },
    (payload) => {
      if (payload.success) {
        const removedCourseIds = selectedCourses.value.map(course => course._id);
        courses.value = [
          ...courses.value.filter(course => !removedCourseIds.includes(course._id)),
        ];
      }
    }
  )
  isDeleting.value = false;
}

const confirmDelete = () => {
  confirm.require({
    message: `Are you sure you want to delete ${selectedCourses.value.length === 1 ? 'this course' : 'these courses'}?`,
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
      deleteCourses()
    }
  })
}

//Updating course
const isUpdating = ref(false);
const courseToUpdate = ref(null);
const openUpdateDialog = (course) => {
  courseToUpdate.value = course;
  isUpdating.value = true;
}

const onHide = () => {
  courseToUpdate.value = null;
  isUpdating.value = false;
}

const updateCourse = (course) => {
  if (courses.value) {
    const updatedCourses = courses.value.map(c => {
      if (c._id === course._id) {
        return course;
      }
      return c;
    });
    courses.value = updatedCourses;
  }
}

const handleUpdatedCourse = (course) => {
  if (courses.value) {
    const updatedCourses = courses.value.map(u => {
      if (u._id === course._id) {
        return course;
      }
      return u;
    });
    courses.value = updatedCourses;
  }
  onHide();
}


onMounted(async () => {
  await Promise.all([
    getCourses(),
  ])
});

</script>

<template>
  <section class="h-full overflow-y-auto">
    <header class="bg-white border-y px-5 py-2 flex items-center gap-2 justify-between flex-wrap">
      <div class="flex items-center gap-3 justify-between">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1 transition-all">
            <CheckBox v-model="allSelected" :binary="true" />
            <Button @click="confirmDelete" v-show="areAnyCoursesSelected" size="small" icon="pi pi-trash"
              severity="danger" text :loading="isDeleting" />
          </div>
          <p class="font-semibold">
            {{ selectedCourses.length ? `${selectedCourses.length}/` : "" }}{{ filteredCourses.length }}
          </p>
          <p class="font-semibold">
            Courses
          </p>
        </div>

        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model.trim="search" placeholder="Search" fluid class="h-8 text-sm" />
        </IconField>
      </div>

      <Button @click="visible = true" label="Add" icon="pi pi-plus" size="small" />
      <Dialog v-model:visible="visible" modal header="Add course">
        <AddCourse  @add-course="handleCourseAdd" />
      </Dialog>
    </header>

    <div class="max-h-[calc(100%-4rem)] overflow-y-auto">
      <section v-if="error" class="h-72 px-2 pb-5 md:px-5 grid w-full place-content-center">
        <ServerError :error @retry="getCourses" />
      </section>

      <section v-else-if="courses" class="h-full px-2 pb-5 md:px-5 grid gap-4">
        <Dialog v-model:visible="isUpdating" @hide="onHide" modal header="Edit course">
          <UpdateCourse :updated-course="courseToUpdate" @update-course="handleUpdatedCourse" />
        </Dialog>

        <div v-if="filteredCourses.length" class="h-full">
          <table class="table-auto w-full whitespace-nowrap md:whitespace-normal">
            <thead class="text-left sticky top-0 bg-slate-100 text-sm">
              <tr class="*:p-1">
                <th></th>
                <th></th>
                <th>Code</th>
                <th>Title</th>
                <th>Semester</th>
                <th>Level</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="course in filteredCourses" :key="course._id"
                class="group border-b *:p-2 hover:bg-slate-200 transition-colors duration-100 cursor-pointer"
                :class="{ 'bg-slate-200': course.checked }">
                <td>
                  <Checkbox v-model="course.checked" @click="updateCourse(course)" :binary="true" />
                </td>
                <td>
                  <Avatar size="small" shape="circle" :label="course.code[0]" class="bg-[--p-primary-200]" />
                </td>
                <td>{{ course.code.split("-").join(" ") }}</td>
                <td>{{ course.title }}</td>
                <td>{{ course.semester }}</td>
                <td>{{ course.level }}</td>
                <td>
                  <Button @click="openUpdateDialog(course)" icon="pi pi-file-edit" rounded />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="w-full">
          <div class="grid place-content-center opacity-70 gap-3 h-60">
            <VIcon icon="doc" height="100" width="100" />
            <p class="text-lg font-semibold">No Courses</p>
          </div>
        </div>
      </section>
    </div>

  </section>
</template>
