<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import useFetch from "@/composables/fetch/use-fetch";
import { useConfirm } from "primevue/useconfirm";


const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const { error, data: pins } = useFetch("admin/pins", { router, toast, cache: true }, (payload) => console.log(payload))

const isDeleting = ref(false);

const deletePins = async () => {
  isDeleting.value = true;
  return
  await useFetch(
    "admin/delete-pins",
    { method: "POST", router, toast, toastOnFailure: true, toastLife: 8000, body: selectedResults.value },
    (payload) => {
      if (payload.success) {
        const removedResultsIds = selectedResults.value.map(result => result._id);
        data.value.results = [
          ...data.value.results.filter(result => !removedResultsIds.includes(result._id)),
        ];
      }
    }
  )
  isDeleting.value = false;
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
      deletePins()
    }
  })
}
</script>

<template>
  <section class="h-full overflow-y-auto">
    <header class="bg-white border-y px-5 py-2 flex items-center gap-2 justify-between flex-wrap">
      <p class="font-semibold">PINs</p>

      <div class="flex items-center gap-2">
        <Button label="Remove expired PINs" size="small" severity="secondary" icon="pi pi-clock" />
        <Button @click="confirmDelete" size="small" icon="pi pi-trash" label="Delete all PINs" severity="danger"
          outlined :loading="isDeleting" />
      </div>
    </header>

    <div class="h-[calc(100%-4rem)] overflow-y-auto">
      <div class="px-2 md:px-5 pt-4">
        <Card>
          <template #title>PIN Generator</template>
          <template #content>
            <VPinGenerator />
          </template>
        </Card>
      </div>

      <section v-if="error" class="h-72 px-2 pb-5 md:px-5 grid w-full place-content-center">
        <ServerError :error reloadOnRetry />
      </section>

      <section v-if="pins" class="h-full px-2 pb-5 md:px-5 grid gap-4">
        ffdfdf dfddf fsf
      </section>
    </div>

  </section>
</template>