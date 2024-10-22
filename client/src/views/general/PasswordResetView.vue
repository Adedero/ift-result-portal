<script setup>
import { ref } from 'vue';
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
  error: null,
  errorMessage: ""
});

const resetPassword = async () => {

}
</script>

<template>
  <div>
    <h1 class="font-semibold text-4xl">Reset Password</h1>
    <div v-if="error" class="mt-5">
      <ServerError :error reloadOnRetry />
    </div>

    <div v-else-if="user" class="mt-2">
      <p>Enter the OTP that has been sent to your email: <span class="font-semibold">{{ maskEmail(user.email) }}</span>
      </p>

      <Stepper value="1" linear class="mt-5">
        <StepList>
          <Step value="1"></Step>
          <Step value="2"></Step>
          <Step value="3"></Step>
        </StepList>
        <StepPanels>
          <StepPanel v-slot="{ activateCallback }" value="1" class="bg-transparent">
            <div>
              <InputOtp v-model="otp" integerOnly mask :length="6" />
            </div>
            <div class="flex pt-6 justify-end">
              <Button label="Next" icon="pi pi-arrow-right" :disabled="!otp || !otp.length !== 6" @click="activateCallback('2')" />
            </div>
          </StepPanel>

          <StepPanel v-slot="{ activateCallback }" value="2">
            <div class="grid">
              <label for="password">New password</label>
              <Password v-model.trim="passwords.newPassword" input-id="password"
                placeholder="Enter your new password" />
              <small v-if="passwords.error">{{ passwords.errorMessage }}</small>
            </div>
            <div class="flex pt-6 justify-between">
              <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
              <Button label="Next" icon="pi pi-arrow-right" iconPos="right"
                :disabled="!passwords.newPassword.length > 7" @click="activateCallback('3')" />
            </div>
          </StepPanel>

          <StepPanel v-slot="{ activateCallback }" value="3">
            <div class="grid">
              <label for="confirm-password">New password</label>
              <Password v-model.trim="passwords.newPassword" input-id="confirm-password"
                placeholder="Confirm your password" />
              <small v-if="passwords.error">{{ passwords.errorMessage }}</small>
            </div>

            <div class="flex pt-6 justify-between">
              <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" />
              <Button label="Submit" icon="pi pi-check-circle" iconPos="right" @click="resetPassword" />
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>
    </div>
  </div>
</template>