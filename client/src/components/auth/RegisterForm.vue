<script setup>
import { defineAsyncComponent, ref } from "vue";
import { useRouter } from "vue-router";
import usePinGenerator from "../../composables/usePinGenerator";
import { useToast } from "primevue/usetoast";

const NewUserForm = defineAsyncComponent({
  loader: () => import("./NewUserForm.vue")
})
const pinGenerator = usePinGenerator();
const router = useRouter();
const toast = useToast();
const PIN = ref("");
const pinData = ref(null);
const loading = ref(false);
const visible = ref(false);
const errorMessage = ref(null);

const validatePin = async () => {
  errorMessage.value = null;

  if (PIN.value.length !== 10) {
    errorMessage.value = "The PIN must be 10 characters long."
    return;
  }
  loading.value = true;
  const { error, data } = await pinGenerator.checkPinValidity(
    PIN.value,
    { router, toast, useBaseUrl: true, sendToken: false }
  )
  loading.value = false;
  if (error) {
    errorMessage.value = error.message
    return;
  }
  pinData.value = data.pin;
  visible.value = true;
}

const op = ref();
const toggle = (event) => {
  op.value.toggle(event);
}
</script>

<template>
  <div class="grid gap-5">
    <div>
      <div class="flex items-center gap-2 justify-between mb-1">
        <label for="pin" class="flex items-center gap-2 justify-between">PIN</label>
        <Button @click="toggle" label="What's my PIN?" icon="pi pi-question-circle" icon-pos="right" size="small"
          text />
        <Popover ref="op">
          <div class="text-sm max-w-60 p-2 text-pretty">
            <span class="pi pi-info-circle"></span>
            The registration PIN is issued by the department. If you don't have a PIN, go to the admin office
            and get one.
          </div>
        </Popover>
      </div>

      <InputText v-model.trim="PIN" type="text" id="pin" fluid :invalid="errorMessage && errorMessage.length" />
      <small v-show="errorMessage" class="text-red-500">{{ errorMessage }}</small>
    </div>

    <Button @click="validatePin" label="Confirm" icon="pi pi-check-circle" fluid :loading @disabled="loading || !PIN" />
    <Dialog v-model:visible="visible" modal class="min-w-40" :header="`${pinData?.role?? ''} Registration`">
      <Suspense>
        <template #default>
          <NewUserForm :pin="pinData" />
        </template>

        <template #fallback>
          <div class="w-full h-60 aspect-square flex items-center justify-center">
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
              animationDuration=".5s" aria-label="Custom ProgressSpinner" />
          </div>
        </template>
      </Suspense>

    </Dialog>
  </div>
</template>