<script setup>
import { defineAsyncComponent, inject, onMounted, reactive, ref } from "vue";
import useFetch from "../../composables/fetch/use-fetch";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import useUserStore from "../../stores/user.store";

const FaceDetector = defineAsyncComponent({
  loader: () => import("./FaceDetector.vue"),
});

const emit = defineEmits(["done"]);

const router = useRouter();
const toast = useToast();
const userStore = useUserStore();
const userLoggingIn = inject("userIdAndPassword");

const loading = reactive({});
const error = reactive({});
const faceDescriptor = ref(null);
const userId = ref(null);

const getUserFaceDescriptor = async () => {
  loading.loadingFaceDescriptor = true;
  error.loadingFaceDescriptor = null;
  const { error: err } = await useFetch(
    `auth/user-face-descriptor/${userLoggingIn.value.id}`,
    { router, toast, useBaseUrl: true, sendToken: false },
    (payload) => {
      faceDescriptor.value = payload.faceDescriptor;
      userId.value = payload.id
    }
  );
  error.loadingFaceDescriptor = err.value;
  loading.loadingFaceDescriptor = false;
}

const login = async (verified) => {
  if (!verified) {
    toast.add({
      severity: "warn",
      summary: "Login failed",
      detail: "Face verification was unsuccessful. Please try again.",
      life: 5000,
    });
    emit("done");
    return;
  }
  loading.loggingIn = true;
  error.loggingIn = null;

  const { error: err } = await useFetch(
    `auth/face-id-login/${userId.value}`,
    { router, toast, method: "POST", useBaseUrl: true, sendToken: false, toastOnFailure: true, toastLife: 5000 },
    (payload) => {
      const loggedInUser = payload.user;
      userStore.setUser(loggedInUser.id, loggedInUser)
      const { role } = loggedInUser;
      switch (role) {
        case "ADMIN":
          router.push({ name: "admin-dashboard", params: { userId: loggedInUser.id } });
          break;
        case "STAFF":
          router.push({ name: "staff-results", params: { userId: loggedInUser.id } });
          break;
        case "STUDENT":
          router.push({ name: "student-results", params: { userId: loggedInUser.id } });
          break;
        default:
          break;
      }
    }
  );
  emit("done");
  loading.loggingIn = false;
  error.loggingIn = err.value
}


onMounted(async () => {
  if (!userLoggingIn.value) return;
  await getUserFaceDescriptor();
});
</script>


<template>
  <div class="w-full">
    <div v-if="loading.loadingFaceDescriptor" class="w-full h-60 flex flex-col gap-5 items-center justify-center">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s"
        aria-label="Custom ProgressSpinner" />

      <p class="font-medium text-slate-500 text-center">Please, wait...</p>
    </div>

    <div v-else-if="error.loadingFaceDescriptor"
      class="max-w-80 text-center border-2 flex flex-col items-center justify-center p-3 border-red-400 rounded-md bg-red-50">
      <header class="flex flex-col items-center justify-center">
        <span class="pi pi pi-times-circle text-red-500" style="font-size: 1.5rem"></span>
        <span class="text-lg font-medium text-red-500">
          {{ error.loadingFaceDescriptor?.status ?? "Something happened." }}
        </span>
      </header>
      <p class="text-red-400 text-sm">
        {{ error.loadingFaceDescriptor?.message ?? "Please try again later." }}
      </p>
      <div class="mt-4">
        <Button size="small" label="Retry" icon="pi pi-refresh" @click="getUserFaceDescriptor" severity="danger" />
      </div>
    </div>

    <div v-else-if="faceDescriptor && Object.keys(faceDescriptor).length > 0">
      <Suspense>
        <template #default>
          <FaceDetector action="verify" :storedFaceDescriptor="faceDescriptor" @verify="login" />
        </template>
        <template #fallback>
          <FaceIdLoader />
        </template>
      </Suspense>
    </div>

    <div v-else
      class="max-w-80 text-center border-2 flex flex-col items-center justify-center p-3 border-red-400 rounded-md bg-red-50">
      <header class="flex flex-col items-center justify-center">
        <span class="pi pi pi-times-circle text-red-500" style="font-size: 1.5rem"></span>
        <span class="text-lg font-medium text-red-500">
          Something happened
        </span>
      </header>
      <p class="text-red-400 text-sm">
        Your face ID data seems to be corrupted. <br>Log in with your password and register a new face ID
      </p>
    </div>
  </div>
</template>


