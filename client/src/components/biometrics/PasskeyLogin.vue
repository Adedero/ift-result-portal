<script setup>
import { inject, onMounted, ref } from "vue";
import useFetch from "../../composables/fetch/use-fetch";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { startAuthentication } from "@simplewebauthn/browser";
import useUserStore from "../../stores/user.store";

const emit = defineEmits(["done"]);

const router = useRouter();
const toast = useToast();
const userStore = useUserStore();
const userLoggingIn = inject("userIdAndPassword");

const isBiometricsSupportedByBrowser = ref(false);
const isBiometricsSupportedByDevice = ref(false);

const loading = ref(false);
const error = ref(false);

const login = async () => {
  loading.value = true;
  error.value = null;
  const { data, error: err } = await useFetch(
    `auth/web-authn-login-init/${userLoggingIn.value.id}`,
    { router, toast, useBaseUrl: true, sendToken: false, toastOnSuccess: true, toastOnFailure: true, toastLife: 8000 }
  );
  error.value = err.value;
  if (!data.value) {
    loading.value = false;
    return
  }
  const webAuthnJSON = await startAuthentication({ optionsJSON: data.value.options });
  if (!webAuthnJSON) {
    loading.value = false;
    error.value = { message: 'Login failed. Try again later.'}
    return
  }
  await useFetch(
    `auth/web-authn-verify/${data.value.user.id}`,
    { method: "POST", router, toast, toastOnSuccess: true, body: { webAuthnJSON } },
    (payload) => {
      if (payload.verified) {
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
      } else {
        toast.add({
          severity: "warn",
          summary: "Login failed. Please try again.",
          life: 5000,
        });
        emit("done");
      }
    }
  )
  loading.value = false;
}


onMounted(async () => {
  if (window.PublicKeyCredential) {
    isBiometricsSupportedByBrowser.value = true;
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    isBiometricsSupportedByDevice.value = available;
    if (available) {
      await login();
    }
  } else {
    isBiometricsSupportedByBrowser.value = false;
    return;
  }
});
</script>


<template>
  <div class="w-full">
    <div v-if="!isBiometricsSupportedByBrowser" class="text-center border-2 border-red-400 rounded-md p-3 bg-red-50">
      <header class="flex flex-col items-center justify-center">
        <span class="pi pi pi-times-circle text-red-500" style="font-size: 1.5rem"></span>
        <span class="text-lg font-medium text-red-500"> Your browser does not support biometrics.</span>
      </header>
      <p class="ml-5 text-red-400">
        We recommend Firefox or Google Chrome for optimal performance. Switch to a different browswer and try again.
      </p>
    </div>

    <div v-else-if="!isBiometricsSupportedByDevice"
      class="text-center border-2 border-red-400 rounded-md p-3 bg-red-50">
      <header class="flex flex-col items-center justify-center">
        <span class="pi pi pi-times-circle text-red-500" style="font-size: 1.5rem"></span>
        <span class="text-lg font-medium text-red-500"> Your device does not support biometrics.</span>
      </header>
      <p class="ml-5 text-red-400">
        Sorry! You cannot use face ID or fingerprint for verification on this device.
      </p>
    </div>

    <div v-else class="w-full h-60 flex flex-col gap-5 items-center justify-center">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s"
        aria-label="Custom ProgressSpinner" />

        <p class="font-medium text-slate-500 text-center">Please, wait...</p>
    </div>
  </div>
</template>