<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import useFetch from '../../composables/fetch/use-fetch';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import maskEmail from '../../utils/mask-email';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const { data: user, error } = await useFetch(
  `auth/get-user-auth-detail/${route.params.userId}`,
  { router, toast, useBaseUrl: true, sendToken: false }
)

const loading = ref(false);
const err = ref(null);

const otp = ref(null);
const passwords = ref({
  newPassword: "",
  confirmPassword: "",
});

const isPasswordTooShort = computed(() => {
  return passwords.value.newPassword && passwords.value.newPassword.length < 8
});

const doPasswordsMatch = computed(() => {
  return passwords.value.confirmPassword === passwords.value.newPassword
});

const resetPassword = async () => {
  if (!user.value.id) {
    router.back()
    return;
  }
  loading.value = true
  err.value = null;
  const { error: e } = await useFetch(
    `auth/reset-password/${user.value.id}`,
    {
      router,
      toast,
      method: "POST",
      useBaseUrl: true,
      sendToken: false,
      body: { OTP: otp.value, passwords: passwords.value }
    },
    (payload) => {
      if(payload.success) {
        router.push("/")
      }
    }
  )
  loading.value = false;
  err.value = e.value;
}


//Resending password;
const seconds = ref(2);
const formattedSeconds = computed(() => {
  return String(seconds.value).padStart(2, '0');
});
const timer = ref(null);
const canResend = computed(() => seconds.value === 0);

const resending = ref(false);
const hasResent = ref(false);
const resend = async () => {
  if (!user.value.email) {
    router.back()
    return;
  }
  resending.value = true;
  err.value = null;
  const { error: e } = await useFetch(
    "auth/send-password-recovery-email",
    { router, toast, toastOnSuccess: true, method: "POST", body: { email: user.value.email }, useBaseUrl: true, sendToken: false },
    async (payload) => {
      if (payload.success) {
        hasResent.value = true;
      }
    }
  )
  resending.value = false;
  err.value = e.value;
}

onMounted(() => {
  timer.value = setInterval(() => {
    seconds.value--
    if (seconds.value === 0) {
      clearInterval(timer.value)
    }
  }, 1000);
});

onUnmounted(() => {
  if(timer.value) clearInterval(timer.value)
})
</script>

<template>
  <div>
    <h1 class="font-semibold text-4xl">Reset Password</h1>
    <div v-if="error" class="mt-5">
      <ServerError :error reloadOnRetry />
    </div>

    <div v-else-if="user" class="mt-2">
      <p v-if="hasResent">
        The OTP has been resent to your email: <span class="font-semibold">{{ maskEmail(user.email) }}</span>
      </p>
      <p v-else>
        Enter the OTP that has been sent to your email: <span class="font-semibold">{{ maskEmail(user.email) }}</span>
      </p>

      <Stepper value="1" linear class="mt-5 w-full">
        <StepList>
          <Step value="1"></Step>
          <Step value="2"></Step>
          <Step value="3"></Step>
        </StepList>
        <StepPanels>
          <StepPanel v-slot="{ activateCallback }" value="1" class="bg-transparent">
            <div class="w-full flex items-center justify-center">
              <InputOtp v-model="otp" integerOnly mask :length="6" />
            </div>
            <div class="flex pt-6 justify-end">
              <Button label="Next" icon="pi pi-arrow-right" :disabled="!otp || otp.length !== 6" @click="activateCallback('2')" />
            </div>

            <div class="flex items-center justify-center gap-1 mt-6 flex-wrap">
              <p class="text-slate-600">Didn't get the OTP?</p>
              <Button text
                @click="resend"
                :label="seconds === 0 ? 'Resend' : `Resend in ${formattedSeconds}s`"
                :disabled="!canResend" :loading="resending" />
            </div>
          </StepPanel>

          <StepPanel v-slot="{ activateCallback }" value="2" class="bg-transparent">
            <div class="grid gap-1">
              <label for="password">New password</label>
              <Password v-model.trim="passwords.newPassword" input-id="password" toggle-mask
                placeholder="Enter your new password" fluid />
              <small v-if="isPasswordTooShort" class="text-red-500">Password must contain at least 8 characters</small>
            </div>
            <div class="flex pt-6 justify-between">
              <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
              <Button label="Next" icon="pi pi-arrow-right" iconPos="right"
                :disabled="isPasswordTooShort" @click="activateCallback('3')" />
            </div>
          </StepPanel>

          <StepPanel v-slot="{ activateCallback }" value="3"  class="bg-transparent">
            <div class="grid gap-1">
              <label for="confirm-password">Confirm password</label>
              <Password v-model.trim="passwords.confirmPassword" input-id="confirm-password"
                placeholder="Confirm your password" fluid/>
                <small v-if="!doPasswordsMatch" class="text-red-500">Passwords do not match!</small>
            </div>

            <div class="flex pt-6 justify-between">
              <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" />
              <Button :disabled="loading || !doPasswordsMatch" label="Submit"
                icon="pi pi-check-circle" iconPos="right" @click="resetPassword" :loading />
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>
      <small v-if="err" class="text-red-500">{{ err.message }}</small>
    </div>
  </div>
</template>