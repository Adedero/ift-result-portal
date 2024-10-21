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
const faceDesciptor = ref(null);

const getUserFaceDescriptor = async () => {
  loading.loadingFaceDescriptor = true;
  error.loadingFaceDescriptor = null;
  const { error: err } = await useFetch(
    `auth/user-face-descriptor/${userLoggingIn.value.id}`,
    { router, toast, useBaseUrl: true, sendToken: false, toastOnSuccess: true, toastLife: 8000 },
    (payload) => {
      faceDesciptor.value = payload.faceDesciptor;
    }
  );
  error.loadingFaceDescriptor = err.value;
  loading.loadingFaceDescriptor = false;
}

const login = async (verified) => {
  loading.loggingIn = true;
  error.loggingIn = null;
  const { error: err } = await useFetch(
    `auth/face-id-login/${userLoggingIn.value.id}`,
    { router, toast, useBaseUrl: true, sendToken: false, toastOnSuccess: true, toastOnFailure: true, toastLife: 8000 },
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
      emit("done");
    }
  );
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
    <div v-if="loading.faceDesciptor" class="w-full h-60 flex flex-col gap-5 items-center justify-center">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s"
        aria-label="Custom ProgressSpinner" />

      <p class="font-medium text-slate-500 text-center">Please, wait...</p>
    </div>

    <div v-else-if="!error.loadingFaceDescriptor"
      class="text-center border-2 flex flex-col items-center justify-center p-3 border-red-400 rounded-md bg-red-50">
      <header class="flex flex-col items-center justify-center">
        <span class="pi pi pi-times-circle text-red-500" style="font-size: 1.5rem"></span>
        <span class="text-lg font-medium text-red-500"> {{ error.loadingFaceDescriptor?.status ?? "Something happened."
          }}</span>
      </header>
      <p class="text-red-400 text-sm">
        {{ error.loadingFaceDescriptor?.message ?? "" }}
      </p>
      <div class="mt-4">
        <Button size="small" label="Retry" icon="pi pi-refresh" @click="getUserFaceDescriptor" severity="danger" />
      </div>
    </div>

    <div v-else-if="!faceDesciptor">
      <Suspense>
        <template #default>
          <FaceDetector action="capture" :storedFaceDescriptor="faceDesciptor" @verify="login" />
        </template>
        <template #fallback>
          <div class="w-full h-full gap-2 flex flex-col items-center justify-center">
            <div class="loader"></div>
          </div>
        </template>
      </Suspense>
    </div>
  </div>
</template>


<style scoped>
.loader {
  width: 17px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--p-primary-500);
  display: grid;
  animation: l22-0 2s infinite linear;
}

.loader:before,
.loader:after {
  content: "";
  grid-area: 1/1;
  margin: 15%;
  border-radius: 50%;
  background: inherit;
  transform: rotate(0deg) translate(150%);
  animation: l22 1s infinite;
}

.loader:after {
  animation-delay: -.5s
}

@keyframes l22-0 {
  100% {
    transform: rotate(1turn)
  }
}

@keyframes l22 {
  100% {
    transform: rotate(1turn) translate(150%)
  }
}
</style>