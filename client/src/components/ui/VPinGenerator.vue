<script setup>
import { ref } from "vue";
import useFetch from "../../composables/fetch/use-fetch";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import usePinGenerator from "../../composables/usePinGenerator";

const selectedUser = ref(null);
const validity = ref("");
const loading = ref(null);
const amount = ref(1);
const data = ref(null);
const router = useRouter();
const toast = useToast();
const visible = ref(false);
const pinGenerator = usePinGenerator();

const emit = defineEmits(["generate-pin"])

const users = [
  { name: "Administrator", role: "ADMIN" },
  { name: "Staff", role: "STAFF" },
  { name: "Student", role: "STUDENT" }
]
const validityOptions = ["30 minutes", "1 hour", "2 hours", "6 hours", "12 hours", "24 hours"];

const generatePin = async () => {
  loading.value = true;
  data.value = null;
  const { data: payload } = await pinGenerator.generatePin(
    selectedUser.value.role,
    validity.value,
    amount.value,
    { router, toast, method: "POST", toastOnFailure: true }
  );
  if (payload) {
    data.value = payload;
    emit("generate-pin", payload.pins)
    visible.value = true;
  };
  loading.value = false;
}
</script>

<template>
  <div class="grid gap-4 md:grid-cols-4">
    <div class="grid gap-1">
      <label for="user" class="text-sm font-semibold text-slate-500">For</label>
      <Select v-model="selectedUser" :options="users" optionLabel="name" placeholder="Select user" fluid
        label-id="user" />
    </div>

    <div class="grid gap-1">
      <label for="validity" class="text-sm font-semibold text-slate-500">Valid for</label>
      <Select v-model="validity" :options="validityOptions" placeholder="Select validity" fluid label-id="validity" />
    </div>

    <div class="grid gap-1">
      <label for="amount" class="text-sm font-semibold text-slate-500">Amount <small>max: 50</small></label>
      <InputNumber v-model="amount" inputId="amount" :min="1" :max="50" fluid :useGrouping="false" />
    </div>


    <div class="grid items-end">
      <Button @click="generatePin" label="Generate" icon="pi pi-plus" fluid
        :disabled="loading || !selectedUser || !validity || !amount" :loading />
    </div>

    <Dialog v-model:visible="visible" class="w-fit" modal header="Registration PIN">
      <div class="flex flex-col items-center justify-center gap-1">
        <span class="pi pi-check-circle text-green-500" style="font-size: 2.5rem; font-weight: bolder;"></span>
        <div v-if="data" class="grid text-center">
          <p>
            PINs generated for: <span class="font-semibold">
              {{ amount }} {{ selectedUser.name }}{{ amount > 1 ? 's' : '' }}</span>
          </p>
          <p>Valid for: <span class="font-semibold">{{ validity }}</span></p>
          <ul class="grid grid-cols-3 md:grid-cols-4 gap-x-2 mt-3">
            <li v-for="pin in data.pins" :key="pin">{{ pin.value }}</li>
          </ul>
          <div class="flex items-center gap-2 mt-4 justify-end">
            <Button label="Done" @click="visible = false" class="mr-auto" />
            <Button @click="printPins" severity="secondary" label="Print" icon="pi pi-print" />
            <Button severity="danger" label="Delete" icon="pi pi-trash" />
          </div>

        </div>
      </div>
    </Dialog>
  </div>
</template>