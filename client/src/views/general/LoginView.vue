<script setup>
import { useToast } from 'primevue/usetoast';
import { defineAsyncComponent, provide, ref } from 'vue';

const PasskeyLogin = defineAsyncComponent({
  loader: () => import("../../components/biometrics/PasskeyLogin.vue")
});

const FaceidLogin = defineAsyncComponent({
  loader: () => import("../../components/biometrics/FaceidLogin.vue")
});

const toast = useToast();
const user = ref({});
provide("userIdAndPassword", user);

const visible = ref(false);
const openPasskeyLogin = () => {
  if(!user.value.id) {
    toast.add({
      severity: 'warn',
      summary: 'ID required',
      detail: 'You need to provide an ID first.',
      life: 5000, 
    });
    return;
  }
  visible.value = true;
}
</script>

<template>
  <section class="pt-4">
    <h1 class="font-semibold text-4xl">Login</h1>
    <small>Welcome back! Enter your details to continue.</small>

    <div class="mt-4 w-full">
      <LoginForm />
      <RouterLink to="/forgot-password"
        class="mt-3 block text-[--p-primary-500] hover:text-[--p-primary-600] hover:underline">
        Forgot password?
      </RouterLink>
    </div>

    <Divider>
      <p class="text-slate-500 text-sm">Or</p>
    </Divider>

    <div class="mt-5 grid gap-2">
      <p>Log in with:</p>

      <Button @click="openPasskeyLogin" label="Face ID" outlined fluid>
        <template #icon>
          <VIcon icon="face-id" />
        </template>
      </Button>

      <Dialog v-model:visible="visible" header="Face ID Login">
        <Suspense>
          <template #default>
            <FaceidLogin @done="visible = false" v-if="visible" />
          </template>

          <template #fallback>
            <div
              class="w-full h-40 shadow bg-white rounded-md p-5 flex items-center justify-centers">
              <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
                animationDuration=".5s" aria-label="Custom ProgressSpinner" />
            </div>
          </template>
        </Suspense>
      </Dialog>

      <!-- <Dialog v-model:visible="visible" header="Biometric login" class="w-96 max-w-[26rem]">
        <Suspense>
          <template #default>
            <PasskeyLogin @done="visible = false" v-if="visible" />
          </template>

          <template #fallback>
            <div
              class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-40 shadow bg-white rounded-md p-5 flex items-center justify-centers">
              <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
                animationDuration=".5s" aria-label="Custom ProgressSpinner" />
            </div>
          </template>
        </Suspense>
      </Dialog> -->



      <!-- <FaceId>
        <template #open-button="{ open }">
          <Button @click="openFaceIdDialog(open)" label="Face ID" outlined fluid>
            <template #icon>
              <VIcon icon="face-id" />
            </template>
          </Button>
        </template>
      </FaceId>


      <Button label="Fingerprint" outlined fluid>
        <template #icon>
          <VIcon icon="fingerprint" />
        </template>
      </Button> -->
    </div>

    <div class="mt-5 text-sm">
      <p>Don't have an account?
        <RouterLink to="/register"
          class="font-semibold hover:underline text-[--p-primary-500] hover:text-[--p-primary-600]">
          Register here
        </RouterLink>.
      </p>
    </div>
  </section>
</template>