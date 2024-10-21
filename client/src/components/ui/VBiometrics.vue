<script setup>
import { onMounted, ref } from 'vue';
import useFetch from '../../composables/fetch/use-fetch';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import biometrics from "@/assets/biometrics.svg";
import useUserStore from '../../stores/user.store';
import { startRegistration } from '@simplewebauthn/browser';

const props = defineProps({ role: { type: String, default: "${props.role}" } });
const router = useRouter();
const toast = useToast();
const userStore = useUserStore();

const isBiometricsSupportedByBrowser = ref(false);
const isBiometricsSupportedByDevice = ref(false);

const loading = ref(false);
const error = ref(null);
const data = ref(null);

const getAuthnPasskeys = async () => {
  loading.value = true;
  error.value = null;
  const { error: err } = await useFetch(
    `${props.role}/web-authn-passkeys/${userStore.user.id}`,
    { router, toast },
    (payload) => {
      if (payload && payload.passkeys) {
        data.value = {
          passkeys: payload.passkeys
        }
      }
    }
  );
  loading.value = false;
  error.value = err.value;
}

const isRegistering = ref(false);
const regError = ref(null);
const registerBiometrics = async () => {
  isRegistering.value = true;
  regError.value = null;
  const { data: optionsData, error: err } = await useFetch(
    `${props.role}/web-authn-register/${userStore.user.id}`,
    { method: "POST", router, toast }
  );

  if (optionsData.value) {
    const { options } = optionsData.value;
    const webAuthnJSON = await startRegistration({ optionsJSON: options });
    if (!webAuthnJSON) {
      isRegistering.value = false;
      regError.value = "Failed to register biometrics. Your device may not support this feature."
    }
    const { error: e } = await useFetch(
      `${props.role}/web-authn-save/${userStore.user.id}`,
      { method: "POST", router, toast, body: { webAuthnJSON } },
      (payload) => {
        toast.add({ severity: payload.verified ? 'success' : 'warning', summary: payload.info, detail: payload.message });
        
        isRegistering.value = false;
        regError.value = e.value;
        return;
      }
    );
  }
  isRegistering.value = false;
  regError.value = err.value;
}

onMounted(async () => {
  if (window.PublicKeyCredential) {
    isBiometricsSupportedByBrowser.value = true;
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    isBiometricsSupportedByDevice.value = available;
    if (available) {
      await getAuthnPasskeys();
    } 
  } else {
    isBiometricsSupportedByBrowser.value = false;
    return;
  }
});
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div v-if="!isBiometricsSupportedByBrowser" class="text-center border-2 border-red-400 rounded-md p-3 bg-red-50">
      <header>
        <span class="pi pi pi-times-circle text-red-500"></span>
        <span class="text-lg font-medium text-red-500"> Your browser does not support biometrics.</span>
      </header>
      <p class="ml-5 text-red-400">
        We recommend Firefox or Google Chrome for optimal performance. Switch to a different browswer and try again.
      </p>
    </div>

    <div v-else-if="!isBiometricsSupportedByDevice"
      class="text-center border-2 border-red-400 rounded-md p-3 bg-red-50">
      <header>
        <span class="pi pi pi-times-circle text-red-500"></span>
        <span class="text-lg font-medium text-red-500"> Your device does not support biometrics.</span>
      </header>
      <p class="ml-5 text-red-400">
        Sorry! You cannot use face ID or fingerprint for verification on this device.
      </p>
    </div>

    <div class="mt-4">
      <section v-if="loading" class="h-72 px-2 pb-5 md:px-5 grid w-full place-content-center">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s"
          aria-label="Custom ProgressSpinner" />
      </section>

      <section v-else-if="error" class="h-72 px-2 pb-5 md:px-5 grid w-full place-content-center">
        <ServerError :error @retry="getAuthnPasskeys" />
      </section>

      <div v-else-if="data && data.passkeys.length < 1">
        <Card class="w-full">
          <template #title>Set up biometrics</template>
          <template #content>
            <div class="w-full text-center md:text-left flex flex-col md:flex-row items-center gap-4">
              <div class="min-w-40 w-[10%] max-w-80">
                <img :src="biometrics" alt="biometrics" class="w-full">
              </div>

              <div class="text-balance">
                <p class="text-green-500 font-medium text-lg">
                  <span class="pi pi-check-circle"></span>
                  Your device supports biometrics.
                </p>
                <p>
                  But you need to set it up for your account first!
                </p>
                <Divider />
                <Button @click="registerBiometrics" :label="isRegistering ? 'Setting up...' : 'Set up biometrics'"
                  icon="pi pi-hourglass" :loading="isRegistering" />
                <small v-if="regError" class="block mt-2 text-red-500">{{ regError.message }}</small>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div v-else-if="data && data.passkeys.length > 0">
        <Card class="w-full">
          <template #title>All good here.</template>
          <template #content>
            <div class="w-full text-center md:text-left flex flex-col md:flex-row items-center gap-4">
              <div class="min-w-40 w-[10%] max-w-80">
                <img :src="biometrics" alt="biometrics" class="w-full">
              </div>

              <div class="text-balance">
                <p class="text-green-500 font-medium text-lg">
                  <span class="pi pi-check-circle"></span>
                  Your biometrics is up and running.
                </p>
                <p>
                  You can log in with your face ID or fingerprint if you have any one configured on your device.
                </p>
                <Divider />
                <Button @click="registerBiometrics"
                  :label="isRegistering ? 'Registering...' : 'Register new biometrics'" icon="pi pi-hourglass"
                  :loading="isRegistering" />
                <small v-if="regError" class="block mt-2 text-red-500">{{ regError.message }}</small>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>