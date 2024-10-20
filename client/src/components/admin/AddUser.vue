<script setup>
import { computed, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import titles from "@/data/titles";
import classes from "@/data/classes";
import useFetch from "../../composables/fetch/use-fetch";

const props = defineProps({
  role: { type: String, required: true }
});

const emit = defineEmits(["add-user"])

const router = useRouter();
const toast = useToast();
const loading = ref(false);

const user = ref({});

const isDisabled = computed(() => {
  const isCommonFieldsInvalid = !user.value.firstName || !user.value.lastName || !user.value.sex || !(user.value.password && user.value.password.length > 7);
  if (props.role === "STUDENT") {
    return (isCommonFieldsInvalid || !user.value.regNumber || !user.value.level)
  }
  if (props.role === "STAFF") {
    return (isCommonFieldsInvalid || !user.value.studentClass || !user.value.staffId)
  }
  if (props.role === "ADMIN") {
    return (isCommonFieldsInvalid || !user.value.username)
  }
  return isCommonFieldsInvalid;
});

const isPasswordTooShort = ref(false);
const checkPasswordLength = () => {
  if (user.value.password) {
    if (user.value.password.length < 8) isPasswordTooShort.value = true;
    else isPasswordTooShort.value = false;
  }
}

const submitForm = async () => {
  const role = props.role.toUpperCase();
  loading.value = true;
  const newUser = { ...user.value, role }
  await useFetch(
    `admin/user`,
    { router, toast, method: "POST", body: newUser, toastOnSuccess: true, toastOnFailure: true, toastLife: 8000 },
    (payload) => {
      emit("add-user", payload.user);
    }
  )
  loading.value = false;
}

onUnmounted(() => {
  user.value = {};
})
</script>

<template>
  <div>
    <p class="text-sm text-red-500">* Required</p>
    <div class="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
      <div v-if="role === 'STAFF' || role === 'ADMIN'" class="grid">
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

      <div v-if="role === 'STUDENT'" class="grid">
        <label for="reg-number" class="text-sm text-slate-600 font-medium">Reg. Number
          <span class="text-red-500">*</span>
        </label>
        <InputNumber v-model.trim="user.regNumber" input-id="reg-number" :useGrouping="false" fluid />
      </div>

      <div v-if="role !== 'STUDENT'" class="grid">
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

      <div v-if="role === 'STUDENT'" class="grid">
        <label for="level" class="text-sm text-slate-600 font-medium">Level
          <span class="text-red-500">*</span>
        </label>
        <Select v-model="user.level" :options="[100, 200, 300, 400, 500, 600, 700]" fluid input-id="level" />
      </div>

      <div v-if="role !== 'STUDENT'" class="grid">
        <label for="student-class" class="text-sm text-slate-600 font-medium">Student class
          <span v-show="role === 'STAFF'" class="text-red-500">*</span>
        </label>
        <Select v-model="user.studentClass" :options="classes" fluid input-id="student-class" />
      </div>

      <div :class="['grid', role !== 'STUDENT' ? 'md:col-span-2 lg:col-span-3' : '']">
        <label for="email" class="text-sm text-slate-600 font-medium">Email</label>
        <InputText v-model.trim="user.email" id="email" type="email" fluid />
      </div>

      <div class="grid">
        <label for="username" class="text-sm text-slate-600 font-medium">Username</label>
        <InputText v-model.trim="user.username" id="username" type="text" fluid />
      </div>

      <div class="grid relative">
        <label for="password" class="text-sm text-slate-600 font-medium">Password
          <span class="text-red-500">*</span>
        </label>
        <Password @input="checkPasswordLength" v-model.trim="user.password" input-id="password" fluid />
        <small v-show="isPasswordTooShort" class="bg-white p-0.5 rounded-md md:top-16 md:absolute text-red-500">
          Password must be at least 8 characters.</small>
      </div>

      <div class="flex items-end">
        <Button label="Submit" icon="pi pi-user-plus" :disabled="loading || isDisabled" @click="submitForm" :loading
          fluid />
      </div>
    </div>
  </div>
</template>