<script setup>
import { defineAsyncComponent, onMounted, ref } from 'vue';
import useFetch from '../../composables/fetch/use-fetch';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import biometrics from "@/assets/biometrics.svg";
import useUserStore from '../../stores/user.store';
import { useConfirm } from 'primevue/useconfirm';

const FaceDetector = defineAsyncComponent({
  loader: () => import('../biometrics/FaceDetector.vue')
})

const props = defineProps({ role: { type: String, default: "student" } });
const router = useRouter();
const toast = useToast();
const userStore = useUserStore();
const confirm = useConfirm();


const visible = ref(false); //To register or change
const visible_2 = ref(false) //To test

const loading = ref(false);
const error = ref(null);
const data = ref(null);

//Register descriptor or change
const registering = ref(false);
const registerFaceId = async (descriptor) => {
  visible.value = false;
  registering.value = true;
  await useFetch(
    `${props.role}/register-face-id`,
    { router, toast, body: { descriptor }, method: 'POST', toastOnSuccess: true, toastLife: 5000, toastOnFailure: true },
    (payload) => {
      userStore.setUser(userStore.user.id, { faceDescriptor: payload.descriptor });
    }
  );
  registering.value = false;
}

const testFaceId = (verified) => {
  visible_2.value = false;
  if (!verified) {
    toast.add({
      severity: "warn",
      summary: "No match!",
      detail: "Face ID verification failed. Register a new face ID and try again",
      life: 6000
    });
    return
  }
  toast.add({
    severity: "success",
    summary: "It's a match!",
    detail: "Face ID verification was successful.",
    life: 5000
  });
}

const deleting = ref(false);
const deleteFaceId = async () => {
  deleting.value = true;
  await useFetch(
    `${props.role}/delete-face-id`,
    { router, toast, method: 'PUT', toastOnSuccess: true, toastLife: 5000, toastOnFailure: true },
    () => {
      userStore.setUser(userStore.user.id, { faceDescriptor: {} });
    }
  )
  deleting.value = false;
}

const confirmDelete = () => {
  confirm.require({
    message: 'Are you sure you want to proceed?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger'
    },
    accept: () => {
      deleteFaceId()
    },
  })
}

//Delete descriptor
</script>

<template>
  <div class="h-full overflow-y-auto">
    <div v-if="!userStore.user.faceDescriptor || Object.keys(userStore.user.faceDescriptor).length === 0"
      class="text-center border-2 border-blue-400 rounded-md p-3 bg-blue-50">
      <header class="grid">
        <span class="pi pi pi-info-circle text-blue-500" style="font-size: 1.5rem"></span>
        <span class="text-lg font-medium text-blue-500">No Face ID</span>
      </header>
      <p class="ml-5 text-blue-400">
        You have not yet enabled facial recognition for your account.
      </p>
      <Button @click="visible = true" :loading="registering" label="Set up face ID" icon="pi pi-face-smile" class="mt-2" />
    </div>

    <div v-else>
      <Card class="w-full">
          <template #title>All good here.</template>
          <template #content>
            <div class="w-full text-center md:text-left flex flex-col md:flex-row items-center gap-4">
              <div class="min-w-60 w-[10%] max-w-96">
                <img :src="biometrics" alt="biometrics" class="w-full">
              </div>

              <div class="text-balance flex flex-col items-center justify-center">
                <div class="flex flex-col gap-2 md:flex-row items-center">
                  <p class="text-green-500 font-medium text-lg">
                  <span class="pi pi-face-smile"></span>
                  Your face ID is set up and running.
                </p>
                <Button @click="visible_2 = true" label="Verify" icon="pi pi-check-circle" />
                </div>
                
                <p class="mt-4 md:mt-3">
                  What do you want to do next?
                </p>
                <Divider class="py-1" />
                <div class="flex items-center justify-center gap-2 flex-wrap">
                  <Button @click="visible = true" :loading="registering" severity="secondary" icon="pi pi-refresh" label="Change Face ID" />
                  <Button @click="confirmDelete" :loading="deleting" severity="danger" outlined icon="pi pi-trash" label="Delete Face ID" />
                </div>
              </div>
            </div>
          </template>
        </Card>
    </div>

    <Dialog v-model:visible="visible" modal header="Register Face ID" class="w-80 md:w-96">
      <Suspense>
        <template #default>
          <FaceDetector v-if="visible" action="capture" @capture="registerFaceId" />
        </template>
        <template #fallback>
          <div>
            <FaceIdLoader />
          </div>
        </template>
      </Suspense>
    </Dialog>

    <Dialog v-model:visible="visible_2" modal header="Register Face ID">
      <Suspense>
        <template #default>
          <FaceDetector v-if="visible_2" :storedFaceDescriptor="userStore.user.faceDescriptor" action="verify" @verify="testFaceId" />
        </template>
        <template #fallback>
          <div>
            <FaceIdLoader />
          </div>
        </template>
      </Suspense>
    </Dialog>
  </div>
</template>