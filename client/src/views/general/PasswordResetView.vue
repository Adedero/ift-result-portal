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
  { router, toast, useBaseUrl: true }
)

const loading = ref(false);
const err = ref(null);
</script>

<template>
  <div>
    <div v-if="error">
      <ServerError :error reloadOnRetry />
    </div>

    <div v-else-if="user">
      <p>Enter the OTP that has been sent to your email: <span class="font-semibold">maskEmail(user.email)</span> </p>

      <Stepper value="1" linear>
        <StepList>
          <Step value="1"></Step>
          <Step value="2"></Step>
          <Step value="3"></Step>
        </StepList>
        <StepPanels>
          <StepPanel v-slot="{ activateCallback }" value="1">
            <div class="flex flex-col h-48">

            </div>
            <div class="flex pt-6 justify-end">
              <Button label="Next" icon="pi pi-arrow-right" @click="activateCallback('2')" />
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="2">
            <div class="flex flex-col h-48">

            </div>
            <div class="flex pt-6 justify-between">
              <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
              <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('3')" />
            </div>
          </StepPanel>
          <StepPanel v-slot="{ activateCallback }" value="3">
            <div class="flex flex-col h-48">
              <div
                class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center items-center font-medium">
                Content III</div>
            </div>
            <div class="pt-6">
              <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('2')" />
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>
    </div>
  </div>
</template>