<script setup>
import { reactive, ref } from 'vue';
import useFetch from '../../composables/fetch/use-fetch';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
const props = defineProps({
  role: {
    type: String,
    default: "student"
  },
  user: {
    type: Object,
    required: true
  }
})
const visible = ref(false);
const open = () => visible.value = true;

const router = useRouter();
const toast = useToast();
const passwords = reactive({});

const loading = ref(false);
const message = ref("");
const verifyOldPassword = async (cb) => {
  loading.value = true;
  message.value = ""
  await useFetch(
    `${props.role}/verify-old-password/${props.user._id}`,
    { router, toast, method: "POST", body: { password: passwords.oldPassword }, toastOnFailure: true },
    (payload) => {
      if (payload.verified) {
        cb("2")
      } else {
        message.value = "Wrong password."
      }
    }
  );
  loading.value = false;
}

const changePassword = async () => {
  loading.value = true;
  message.value = "";
  const { error, data } = await useFetch(
    `${props.role}/change-password/${props.user._id}`,
    { router, toast, method: "POST", body: { passwords }, toastOnSuccess: true }
  );
  if (data.value && data.value.success) {
    setTimeout(() => {
      router.push('/');
    }, 3000);
  }
  message.value = error.value && error.value.message;
  loading.value = false;
}
</script>

<template>
  <div>
    <slot :open>
      <Button @click="open" label="Change password" icon="pi pi-lock" outlined />
    </slot>

    <Dialog v-model:visible="visible" header="Change Password" class="max-w-96">
      <Stepper value="1" linear>
        <StepList>
          <Step value="1">1</Step>
          <Step value="2">2</Step>
          <Step value="3">3</Step>
        </StepList>

        <StepPanels>
          <StepPanel v-slot="{ activateCallback }" value="1">
            <div class="grid gap-1">
              <p class="text-slate-500 text-sm font-medium">Enter your old password</p>
              <Password v-model="passwords.oldPassword" :feedback="false" toggle-mask />
              <small v-if="message" class="text-red-500 font-medium">{{ message }}</small>
            </div>

            <div class="flex pt-6 justify-end">
              <Button label="Next" icon="pi pi-arrow-right" @click="verifyOldPassword(activateCallback)"
                :disabled="!passwords.oldPassword || loading" />
            </div>
          </StepPanel>

          <StepPanel v-slot="{ activateCallback }" value="2">
            <div class="grid gap-1">
              <p class="text-slate-500 text-sm font-medium">Enter your new password</p>
              <Password v-model="passwords.newPassword" toggle-mask />
              <small>Password must be at least 8 characters</small>
            </div>

            <div class="flex pt-6 justify-between">
              <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
              <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('3')"
                :disabled="!passwords.newPassword || passwords.newPassword.length < 8" />

            </div>
          </StepPanel>

          <StepPanel v-slot="{ activateCallback }" value="3">
            <div class="grid gap-1">
              <p class="text-slate-500 text-sm font-medium">Confirm your new password</p>
              <Password v-model="passwords.confirmPassword" :feedback="false" toggle-mask />
              <small v-show="passwords.confirmPassword && (passwords.confirmPassword !== passwords.newPassword)"
                class="text-red-500 font-medium">
                Passwords do not match!
              </small>
              <small v-if="message" class="text-red-500 font-medium">{{ message }}</small>
            </div>

            <div class="pt-6 flex justify-between">
              <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')"
                :disabled="loading" />
              <Button label="Confirm" icon="pi pi-check-circle" iconPos="right" @click="changePassword"
                :disabled="!passwords.confirmPassword || (passwords.confirmPassword !== passwords.newPassword)"
                :loading />
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>

    </Dialog>
  </div>
</template>