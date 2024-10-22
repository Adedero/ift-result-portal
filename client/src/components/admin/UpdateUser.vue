<script setup>
import { computed, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import titles from "@/data/titles";
import classes from "@/data/classes";
import useFetch from "../../composables/fetch/use-fetch";

const props = defineProps({
  updatedUser: { type: [null, Object] }
});

const emit = defineEmits(["update", "reset-password"])

const router = useRouter();
const toast = useToast();
const loading = ref(false);

const password = ref("");

const user = ref(props.updatedUser ? { ...props.updatedUser } : {});

const isDisabled = computed(() => {
  const isCommonFieldsInvalid = !user.value.firstName || !user.value.lastName || !user.value.sex;
  if (user.value.role === "STUDENT") {
    return (isCommonFieldsInvalid || !user.value.regNumber || !user.value.level)
  }
  if (user.value.role === "STAFF") {
    return (isCommonFieldsInvalid || !user.value.studentClass || !user.value.staffId)
  }
  if (user.value.role === "ADMIN") {
    return (isCommonFieldsInvalid || !user.value.username)
  }
  return isCommonFieldsInvalid;
});

const isPasswordTooShort = ref(false);
const checkPasswordLength = () => {
  if (password.value.length < 8) isPasswordTooShort.value = true;
  else isPasswordTooShort.value = false;
}

const submitForm = async () => {
  if (!props.updatedUser) return;
  loading.value = true;
  await useFetch(
    `admin/user/${user.value._id}`,
    { router, toast, method: "PUT", body: { user: user.value }, toastOnSuccess: true, toastOnFailure: true, toastLife: 5000 },
    (payload) => {
      emit("update", payload.user);
    }
  )
  loading.value = false;
}

//Changing image
const isChangingImage = ref(false);

const handleUpload = async (file) => {
  isChangingImage.value = true;
  const form = new FormData();
  form.append("file", file[0]);
  await useFetch(
    `admin/change-image/${user.value._id}`,
    { method: "POST", router, toast, body: form, toastOnFailure: true },
    (payload) => {
      user.value.image = payload.image;
      window.location.reload();
    }
  )
  isChangingImage.value = false;
}

//Reset password
const isReseting = ref(false);
const resetPassword = async () => {
  isReseting.value = true;
  await useFetch(
    `admin/reset-password/${user.value._id}`,
    { router, toast, method: "PUT", body: { password: password.value }, toastOnSuccess: true, toastOnFailure: true, toastLife: 5000 },
    () => {
      password.value = ""
      emit("reset-password")
    }
  )
  isReseting.value = false;
}

onUnmounted(() => {
  user.value = {};
  password.value = "";
})
</script>

<template>
  <div v-if="updatedUser">
    <div class="mt-4 grid justify-center md:grid-cols-3 gap-4 pb-8">
      <div class="grid">
        <VAvatar :user class="text-5xl bg-[--p-primary-200] w-32 h-32 rounded-full" />
      </div>

      <div class="flex items-end md:col-span-2">
        <VFileUploader :loading="isChangingImage" @upload="handleUpload" accept=".png,.jpg,.jpeg,.bmp,"
          :max-file-size="2 * 1024 * 1024" class="w-full" />
      </div>
    </div>

    <Divider />

    <p class="text-sm text-red-500">* Required</p>

    <div class="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-if="user.role === 'STAFF' || user.role === 'ADMIN'" class="grid">
        <label for="title" class="text-sm text-slate-600 font-medium">Title</label>
        <Select v-model="user.title" :options="titles" fluid input-id="title" />
      </div>

      <div class="grid">
        <label for="first-name" class="text-sm text-slate-600 font-medium">First name
          <span class="text-red-500">*</span>
        </label>
        <InputText v-model.trim="user.firstName" id="first-name" type="text" fluid />
      </div>

      <div class="grid">
        <label for="last-name" class="text-sm text-slate-600 font-medium">Last name
          <span class="text-red-500">*</span>
        </label>
        <InputText v-model.trim="user.lastName" id="last-name" type="text" fluid />
      </div>

      <div v-if="user.role === 'STUDENT'" class="grid">
        <label for="reg-number" class="text-sm text-slate-600 font-medium">Reg. Number
          <span class="text-red-500">*</span>
        </label>
        <InputText v-model.trim="user.regNumber" id="reg-number" fluid v-keyfilter.int />
      </div>

      <div v-if="user.role !== 'STUDENT'" class="grid">
        <label for="staff-id" class="text-sm text-slate-600 font-medium">Staff ID
          <span class="text-red-500">*</span>
        </label>
        <InputText v-model.trim="user.staffId" id="staff-id" type="text" fluid />
      </div>


      <div class="grid">
        <label for="sex" class="text-sm text-slate-600 font-medium">Sex
          <span class="text-red-500">*</span>
        </label>
        <Select v-model="user.sex" :options="['FEMALE', 'MALE']" fluid input-id="sex" />
      </div>

      <div v-if="user.role === 'STUDENT'" class="grid">
        <label for="level" class="text-sm text-slate-600 font-medium">Level
          <span class="text-red-500">*</span>
        </label>
        <Select v-model="user.level" :options="[100, 200, 300, 400, 500, 600, 700]" fluid input-id="level" />
      </div>

      <div v-if="user.role !== 'STUDENT'" class="grid">
        <label for="student-class" class="text-sm text-slate-600 font-medium">Student class
          <span v-show="user.role === 'STAFF'" class="text-red-500">*</span>
        </label>
        <Select v-model="user.studentClass" :options="classes" fluid input-id="student-class" />
      </div>

      <div :class="['grid', user.role !== 'STUDENT' ? 'md:col-span-2' : '']">
        <label for="email" class="text-sm text-slate-600 font-medium">Email</label>
        <InputText v-model.trim="user.email" id="email" type="email" fluid />
      </div>

      <div class="grid">
        <label for="username" class="text-sm text-slate-600 font-medium">Username</label>
        <InputText v-model.trim="user.username" id="username" type="text" fluid />
      </div>

      <div class="flex items-end">
        <Button label="Save" icon="pi pi-check" :disabled="loading || isDisabled" @click="submitForm" :loading fluid />
      </div>
    </div>

    <Divider class="py-2" />

    <p class="text-red-500 font-medium">Reset Password</p>
    <div class="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
      <div class="grid relative lg:col-span-2">
        <label for="password" class="text-sm text-slate-600 font-medium">Password</label>
        <InputText @input="checkPasswordLength" v-model.trim="password" id="password" fluid />
        <small v-show="isPasswordTooShort" class="bg-white p-0.5 rounded-md md:top-16 md:absolute text-red-500">
          Password must be at least 8 characters.</small>
      </div>

      <div class="flex items-end">
        <Button @click="resetPassword" label="Reset Password" icon="pi pi-lock" severity="danger" outlined fluid
          :disabled="!(password && password.length > 7) || isReseting" :loading="isReseting" />
      </div>
    </div>
  </div>
</template>