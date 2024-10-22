<script setup>
import { ref } from 'vue';
import useFetch from '../../composables/fetch/use-fetch';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

const loading = ref(false);
const error = ref(null);

const email = ref("");

const submit = async () => {
  loading.value = true;
  const { error: err } = await useFetch(
    "auth/send-password-recovery-email",
    { router, toast, method: "POST", body: { email: email.value }, useBaseUrl: true, sendToken: false },
    async (payload) => {
      if (payload.success) {
        await router.push({ name: "password-reset", params: { userId: payload.userId }})
      }
    }
  );
  loading.value = false;
  error.value = err.value;
}
</script>

<template>
  <section class="pt-4">
    <h1 class="font-semibold text-4xl">Forgot Password</h1>
    <div class="grid mt-1">
      <small class="leading-1">You will need your email for this step.</small>
      <small>If you didn't set one up, contact the admin to reset your password.</small>
    </div>

    <div class="mt-4 w-full grid gap-4">
      <div class="grid">
        <label for="email">Email</label>
        <InputText v-model.trim="email" type="email" fluid placeholder="Enter your email" />
        <small v-if="error" class="text-red-500">{{ error.message }}</small>
      </div>

      <Button @click="submit" label="Submit" icon="pi pi-check-circle" fluid :loading :disabled="loading || !email" />
    </div>


    <div class="mt-5 text-sm">
      <p>Go back to
        <RouterLink to="/" class="font-semibold hover:underline text-[--p-primary-500] hover:text-[--p-primary-600]">
          Log in
        </RouterLink>.
      </p>
    </div>
  </section>
</template>