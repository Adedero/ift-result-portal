<script setup>
import { useToast } from 'primevue/usetoast';
import { provide, ref } from 'vue';
const toast = useToast();

const user = ref({});
provide("userIdAndPassword", user);

const openPasskeyLogin = (open) => {
  if(!user.value.id) {
    toast.add({
      severity: 'warn',
      summary: 'ID required',
      detail: 'You need to provide an ID first.',
      life: 3000, 
    });
    return;
  }
  open();
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

      <PasskeyLogin>
        <template #open-button="{ open }">
          <Button @click="openPasskeyLogin(open)" label="Face ID or Fingerprint" outlined fluid>
            <template #icon>
              <VIcon icon="fingerprint" />
            </template>
          </Button>
        </template>
      </PasskeyLogin>


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