<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import useFileUpload from "@/composables/use-file-upload";
import sessions from '@/data/sessions';

const emit = defineEmits(["upload"]);
const props = defineProps({
  courses: {
    type: Array,
    required: true,
    default:[]
  },
  uploader: {
    type: String,
    default: "staff"
  }
})

const visible = ref(false);
const open = () => visible.value = true;

const router = useRouter();
const toast = useToast();
const error = ref(null);
const loading = ref(false);
const result = ref({});

const handleUpload = async (files) => {
  result.value.courseCode = result.value.course.code;
  result.value.courseTitle = result.value.course.title;
  loading.value = true;
  error.value = null;
  const { error: err, data } = await useFileUpload(`${props.uploader}/result`, files, { router, toast, body: result.value });
  if (data.value) {
    emit("upload", data.value.result);
    visible.value = false;
  }
  loading.value = false;
  error.value = err.value;

}
</script>

<template>
  <div>
    <slot name="cta-button" open>
      <Button @click="open" label="Upload result" icon="pi pi-plus" size="small" />
    </slot>

    <Dialog v-model:visible="visible" modal header="Upload Result">
      <div class="grid gap-3 md:w-80">
        <div class="grid gap-1">
          <label for="course" class="text-sm text-slate-500 font-medium">Course</label>
          <Select v-model="result.course" option-label="code" :options="courses" fluid input-id="course" />
        </div>

        <div class="grid gap-1">
          <label for="session" class="text-sm text-slate-500 font-medium">Session</label>
          <Select v-model="result.session" :options="sessions" fluid input-id="session" />
        </div>


        <div class="grid gap-1">
          <label for="result-file" class="text-sm text-slate-500">
            File <small>(format: pdf or images; multiple files will be merged.)</small>
          </label>
          <VFileUploader @upload="handleUpload" input-id="result-file" accept=".pdf,.jpg,.png,.jpeg" multiple
            :max-file-number="10" :max-file-size="10 * 1024 * 1024"
            :upload-disabled="loading || !result.session || !result.course" :loading />
        </div>

        <small v-if="error" class="text-red-500 text-center">{{ error.message }}</small>
      </div>
    </Dialog>
  </div>
</template>