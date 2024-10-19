<script setup>

import { computed, ref } from 'vue';
import useFetch from '../../composables/fetch/use-fetch';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import useUserStore from '../../stores/user.store';
const props = defineProps({
  pin: { type: Object, required: true, default: {} }
});

const router = useRouter();
const toast = useToast();
const userStore = useUserStore();
const user = ref({});
const visible = ref(false);

const titles = ["Dr.", "Engr.", "Prof.", "Mr.", "Mrs.", "Ms.", "Sir"];
const classes = ["2018-2019", "2019-2020", "2020-2021", "2021-2022", "2022-2023", "2023-2024", "2024-2025", "2025-2026", "2026-2027", "2027-2028", "2029-2030"]

const isDisabled = computed(() => {
  const isCommonFieldsInvalid = !user.value.firstName || !user.value.lastName || !user.value.sex;
  if (props.pin.role === "STUDENT") {
    return (isCommonFieldsInvalid || !user.value.regNumber || !user.value.level)
  }
  if (props.pin.role === "STAFF") {
    return (isCommonFieldsInvalid || !user.value.studentClass || !user.value.staffId)
  }
  return isCommonFieldsInvalid;
});

const isPasswordTooShort = ref(false);
const checkPasswordLength = () => {
  if (user.value.password) {
    if (user.value.password.length < 7) isPasswordTooShort.value = true;
    else isPasswordTooShort.value = false;
  }
}

const passwordMismatch = ref(false);
const checkPasswordMatch = () => {
  if (user.value.password && user.value.password.length && user.value.confirmPassword && user.value.confirmPassword.length) {
    if (user.value.confirmPassword !== user.value.password) passwordMismatch.value = true;
    else passwordMismatch.value = false;
  }
}

const loading = ref(false);
const error = ref(null);
const registeredUser = ref({});
const register = async () => {
  loading.value = true;
  error.value = null;
  const { error: err } = await useFetch(
    'auth/register',
    { method: "POST", router, toast, useBaseUrl: true, sendToken: false, body: { pin: props.pin, user: user.value } },
    (payload) => {
      visible.value = true;
      userStore.setUser(payload.user.id, payload.user)
      registeredUser.value = payload.user;
    }
  )
  loading.value = false;
  error.value = err.value;
}

const navigationError = ref(false);
const goToEmailSetupPage = () => {
  navigationError.value = false;
  if (!registeredUser.value) {
    navigationError.value = true;
    return;
  }
  router.push({
    name: "email-setup",
    params: {
      userId: registeredUser.value.id
    }
  })
}


const goToDashboard = () => {
  navigationError.value = false;
  if (!registeredUser.value) {
    navigationError.value = true;
    return;
  }
  const role = registeredUser.value.role;

  switch (role) {
    case "ADMIN":
      router.push({ name: "admin-dashboard", params: { userId: registeredUser.value.id } });
      break;
    case "STAFF":
      router.push({ name: "staff-results", params: { userId: registeredUser.value.id } });
      break;
    case "STUDENT":
      router.push({ name: "student-results", params: { userId: registeredUser.value.id } });
      break;
    default:
      break;
  }
}
</script>

<template>
  <div>
    <div v-if="visible" class="flex flex-col items-center justify-center gap-2 max-w-96">
      <div class="flex flex-col items-center justify-center">
        <span class="pi pi-check-circle text-green-500" style="font-size: 2.5rem"></span>
        <p class="uppercase font-semibold text-green-500 text-xl mt-1">Success</p>
      </div>
      <div class="text-center">
        <p class="text-lg mb-2">Welcome, <span class="font-semibold">{{ user.title || '' }} {{ user.firstName }} {{
            user.lastName }}</span></p>
        <p>Do you want to take a moment to set up your email? A verified email can help if you ever forget your
          password.</p>
      </div>
      <div class="flex items-center flex-wrap justify-center gap-2 mt-3">
        <Button label="Okay" class="w-28" @click="goToEmailSetupPage" />
        <Button label="Later" severity="secondary" @click="goToDashboard" class="w-28" />
        <small v-show="navigationError" class="text-red-500 w-full text-center">Something went wrong. Try logging in
          instead.</small>
      </div>

    </div>

    <div v-else>
      <Stepper value="1" linear>
        <StepList>
          <Step value="1"><span class="pi pi-user"></span></Step>
          <Step value="2"><span class="pi pi-lock"></span></Step>
          <Step value="3"><span class="pi pi-check-circle"></span></Step>
        </StepList>
        <StepPanels>
          <StepPanel v-slot="{ activateCallback }" value="1">
            <div class="grid md:grid-cols-2 gap-4">
              <div v-if="pin.role === 'STAFF' || pin.role === 'ADMIN'" class="grid">
                <label for="title" class="text-sm text-slate-600 font-medium">Title</label>
                <Select v-model="user.title" :options="titles" fluid input-id="sex" />
              </div>

              <div class="grid">
                <label for="first-name" class="text-sm text-slate-600 font-medium">First name</label>
                <InputText v-model.trim="user.firstName" id="first-name" type="text" fluid />
              </div>

              <div class="grid">
                <label for="last-name" class="text-sm text-slate-600 font-medium">Last name</label>
                <InputText v-model.trim="user.lastName" id="last-name" type="text" fluid />
              </div>

              <div v-if="pin.role === 'STUDENT'" class="grid">
                <label for="reg-number" class="text-sm text-slate-600 font-medium">Reg. Number</label>
                <InputNumber v-model.trim="user.regNumber" input-id="reg-number" :useGrouping="false" fluid />
              </div>

              <div v-if="pin.role === 'STAFF'" class="grid">
                <label for="staff-id" class="text-sm text-slate-600 font-medium">Staff ID</label>
                <InputText v-model.trim="user.staffId" id="staff-id" type="text" fluid />
              </div>

              <div v-if="pin.role === 'ADMIN'" class="grid">
                <label for="username" class="text-sm text-slate-600 font-medium">Username</label>
                <InputText v-model.trim="user.username" id="username" type="text" fluid />
              </div>

              <div class="grid">
                <label for="sex" class="text-sm text-slate-600 font-medium">Sex</label>
                <Select v-model="user.sex" :options="['Female', 'Male']" fluid input-id="sex" />
              </div>

              <div v-if="pin.role === 'STUDENT'" class="grid">
                <label for="level" class="text-sm text-slate-600 font-medium">Level</label>
                <Select v-model="user.level" :options="[100, 200, 300, 400, 500, 600, 700]" fluid input-id="level" />
              </div>

              <div v-if="pin.role === 'STAFF'" class="grid">
                <label for="student-class" class="text-sm text-slate-600 font-medium">Student class</label>
                <Select v-model="user.studentClass" :options="classes" fluid input-id="student-class" />
              </div>

            </div>
            <div class="flex pt-6 justify-end">
              <Button label="Next" icon="pi pi-arrow-right" @click="activateCallback('2')" :disabled="isDisabled" />
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="2">
            <div class="grid p-2">
              <div class="grid w-72">
                <label for="password" class="text-sm text-slate-600 font-medium">Password</label>
                <Password @input="checkPasswordLength" v-model.trim="user.password" id="password" fluid />
                <small v-show="isPasswordTooShort" class="mt-2 text-red-500">Your password must contain at least 8
                  characters.</small>
              </div>
            </div>
            <div class="flex pt-6 justify-between">
              <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
              <Button label="Next" icon="pi pi-arrow-right" iconPos="right"
                :disabled="!user.password || user.password.length < 8" @click="activateCallback('3')" />
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="3">
            <div class="max-w-96">
              <div class="grid p-2 w-72">
                <div class="grid">
                  <label for="confirm-password" class="text-sm text-slate-600 font-medium">Confirm Password</label>
                  <Password @input="checkPasswordMatch" v-model.trim="user.confirmPassword" input-id="confirm-password"
                    fluid :feedback="false" />
                  <small v-show="passwordMismatch" class="mt-2 text-red-500">Passwords do not match!</small>
                </div>
              </div>
              <div class="flex pt-6 justify-between">
                <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" />
                <Button label="Register" icon="pi pi-check-circle" iconPos="right"
                  :disabled="!user.password || !user.confirmPassword || passwordMismatch" @click="register" />
              </div>
              <div class="w-full text-right mt-1">
                <small v-if="error" class="text-red-500 max-w-60 ml-auto">{{ error.message }}</small>
              </div>
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>
    </div>
  </div>
</template>