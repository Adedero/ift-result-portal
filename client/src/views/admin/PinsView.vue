<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import useFetch from "@/composables/fetch/use-fetch";
import { useConfirm } from "primevue/useconfirm";
import usePinGenerator from "../../composables/usePinGenerator";

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();


const { error, data: pins } = await useFetch("admin/pins", { router, toast, cache: true })


const pinGenerator = usePinGenerator();
const loading = ref({});

const addGeneratedPins = (newPins, role) => {
  if (pins.value[role]) {
    pins.value = {
      ...pins.value,
      [role]: [...newPins, ...pins.value[role]]
    };
  } else {
    pins.value = {
      ...pins.value,
      [role]: newPins
    };
  }
};

const deleteAllExpiredPins = async () => {
  loading.value.allExpired = true;
  await pinGenerator.deletePins({
    router, toast, toastLife: 3000, toastOnSuccess: true, toastOnFailure: true, body: { pins: [], expired: true }
  });
  loading.value.allExpired = false;
}


const deleteAllPins = async () => {
  loading.value.all = true;
  const { error } = await pinGenerator.deletePins({
    router, toast, toastLife: 3000, toastOnSuccess: true, toastOnFailure: true, body: { pins: [] }
  });
  if (!error) {
    pins.value = {}
  }
  loading.value.all = false;
}

const deleteAllRolePins = async (role) => {
  loading.value[role] = true;
  const pinRole = role.toUpperCase();
  const { error } = await pinGenerator.deletePins({
    router, toast, toastLife: 3000, toastOnSuccess: true, toastOnFailure: true, body: { role: pinRole, pins: [] }
  });
  if (!error) {
    delete pins.value[role]
  }
  loading.value[role] = true;
}

const confirmDelete = () => {
  confirm.require({
    message: `Are you sure you want to delete all PINs?`,
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
      deleteAllPins()
    }
  })
}
</script>

<template>
  <section class="h-full overflow-y-auto">
    <header class="bg-white border-y px-5 py-2 flex items-center gap-2 justify-between flex-wrap">
      <p class="font-semibold">PINs</p>

      <div class="flex items-center gap-2">
        <Button @click="deleteAllExpiredPins" label="Remove expired PINs"
          size="small" severity="secondary" icon="pi pi-clock" :loading="loading.allExpired" />
        <Button @click="confirmDelete" size="small" icon="pi pi-trash" label="Delete all PINs" severity="danger"
          outlined :loading="loading.all" />
      </div>
    </header>

    <div class="h-[calc(100%-4rem)] overflow-y-auto">
      <div class="px-2 md:px-5 pt-4">
        <Card>
          <template #title>PIN Generator</template>
          <template #content>
            <VPinGenerator @generate-pin="addGeneratedPins" />
          </template>
        </Card>
      </div>
      

      <section v-if="error" class="h-72 px-2 pb-5 md:px-5 grid w-full place-content-center">
        <ServerError :error reloadOnRetry />
      </section>

      <section v-else-if="pins" class="mt-4 h-full px-2 pb-5 md:px-5 grid gap-4">
        <Accordion>
          <AccordionPanel v-for="keyPins, key, index in pins" :key :value="index">
              <AccordionHeader>
                <p>{{ key[0].toUpperCase() + key.slice(1, key.length) }} PINs</p>
              </AccordionHeader>
              <AccordionContent>
                <div class="flex justify-end">
                  <Button @click="deleteAllRolePins(key)" :loading="loading[key]" size="small" label="Delete all" severity="danger" outlined class="ml-auto" />
                </div>
                  <div class="grid grid-cols-3 md:grid-cols-5">
                    <p v-for="pin in keyPins" :key="pin._id">{{ pin.value }}</p>
                  </div>
              </AccordionContent>
          </AccordionPanel>
      </Accordion>
      </section>
    </div>

  </section>
</template>