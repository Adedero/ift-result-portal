<script setup>
import { computed, onUnmounted, ref } from 'vue'
const props = defineProps({
  accept: { type: String },
  invalidFileSizeMessage: { type: String },
  invalidFileTypeMessage: { type: String },
  maxFileSize: { type: Number },
  maxFileNumber: { type: [Number, String] },
  buttonType: { type: String, default: 'primary' },
  chooseLabel: { type: String, default: 'Choose' },
  uploadLabel: { type: String, default: 'Upload' },
  multiple: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  inputId: { type: String, default: "v-file-uploader" },
  uploadDisabled: { type: Boolean, default: false },
  
})

const emit = defineEmits(['cancel', 'select', 'upload'])

const files = ref(null)

const uploadError = ref({})

const handleSelect = (event) => {
  uploadError.value = {};
  files.value = Array.from(event.target.files);
  if (props.maxFileNumber) {
    const number = parseInt(props.maxFileNumber, 10)
    if (files.value.length > number) {
      //files.value = files.value.slice(0, number)
      files.value = null;
      uploadError.value = {
        error: true,
        message: `Only ${number} files can be uploaded.`
      }
      return
    }
  }
  if (props.accept) {
    const isFormatValid = files.value.every((file) => {
      const fileType = file.type
      const fileFormat = file.name.split('.').pop().toLowerCase()
      return fileType.match(props.accept) || props.accept.includes(fileFormat)
    })

    if (!isFormatValid) {
      files.value = null
      uploadError.value = {
        error: true,
        message: props.invalidFileTypeMessage || 'File format is not allowed.'
      }
      return
    }
  }

  if (props.maxFileSize) {
    const formattedSize = formatFileSize(props.maxFileSize)
    const isSizeValid = files.value.every((file) => file.size <= props.maxFileSize)

    if (!isSizeValid) {
      files.value = null
      uploadError.value = {
        error: true,
        message: props.invalidFileSizeMessage || `File size exceeds the ${formattedSize} limit.`
      }
      return
    }
  }
  uploadError.value = {
    error: false,
    message: ''
  }

  emit('select', files.value)
}

const handleUpload = () => {
  if (files.value) {
    const emittedFiles = files.value
    emit('upload', emittedFiles)
    files.value = null
  }
}

const handleCancel = () => {
  files.value = null
  uploadError.value = {
    error: false,
    message: ''
  }
  emit('cancel')
}

const uploadText = computed(() => {
  if (files.value) {
    if (files.value.length > 1) {
      return `${files.value.length} files selected`
    } else {
      return files.value[0].name
    }
  }
  return 'No files selected'
})

function formatFileSize(bytes) {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let unitIndex = 0;
  let fileSize = bytes;

  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024;
    unitIndex++;
  }

  return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
}

onUnmounted(() => {
  files.value = null
  uploadError.value = {
    error: false,
    message: ''
  } 
})
</script>

<template>
  <div>
    <Message v-show="uploadError.error" severity="error" closable class="mb-2">
      {{ uploadError.message }}
    </Message>
    <Button v-if="!files" icon="pi pi-upload" :severity="buttonType" fluid style="padding: 0; width: 100%" :loading>
      <template #default>
        <label for="v-file-uploader" class="flex items-center justify-center gap-2 cursor-pointer w-full p-2">
          <span class="pi pi-upload"></span>
          <span>{{ chooseLabel }}</span>
        </label>
      </template>
    </Button>

    <Button v-else @click="handleUpload" icon="pi pi-upload" :severity="buttonType" fluid
      style="padding: 0; width: 100%" :loading :disabled="uploadDisabled">
      <template #default>
        <div class="flex items-center justify-center gap-2 cursor-pointer w-full p-2" :class="{ 'cursor-context-menu' : uploadDisabled}">
          <span :class="loading ? 'pi pi-spinner pi-spin' : 'pi pi-plus'"></span>
          <span>{{ uploadLabel }}</span>
        </div>
      </template>
    </Button>
    <p :class="{ 'text-slate-500': !files }" class="mt-2 text-center font-medium font-600 text-sm">
      {{ uploadText }}
    </p>
    <input id="v-file-uploader" @input="handleSelect" @cancel="handleCancel" type="file" :accept="accept"
      :multiple="multiple" class="hidden" />
  </div>
</template>
