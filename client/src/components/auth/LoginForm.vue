<script setup>
import { inject, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import useFetch from "@/composables/fetch/use-fetch";
import useUserStore from '@/stores/user.store';

const router = useRouter();
const toast = useToast();
const userStore = useUserStore();

const user = inject("userIdAndPassword");
const loading = ref(false);

const login = async () => {
  loading.value = true;
  await useFetch(
    "auth/login",
    {
      method: "POST", 
      body: user.value,
      router,
      toast,
      sendToken: false,
      useBaseUrl: true,
      toastOnFailure: true,
      toastLife: 8000
    },
    (payload) => {
      const loggedInUser = payload.user;
      userStore.setUser(loggedInUser.id, loggedInUser)
      const { role } = loggedInUser;
      switch (role) {
        case "ADMIN":
          router.push({ name: "admin-dashboard", params: { userId: loggedInUser.id } });
          break;
        case "STAFF":
          router.push({ name: "staff-results", params: { userId: loggedInUser.id } });
          break;
        case "STUDENT":
          router.push({ name: "student-results", params: { userId: loggedInUser.id } });
          break;
        default:
          break;
      }
    }
  );
  loading.value = false;
}
</script>

<template>
  <div class="grid gap-5">
    <div>
      <label for="id">ID</label>
      <InputText v-model="user.id" type="text" id="id" fluid placeholder="Username, Email, StaffId or Reg. Number" />
      <small></small>
    </div>

    <div>
      <label for="password">Password</label>
      <Password v-model="user.password" input-id="password" fluid :feedback="false" toggle-mask placeholder="Password" />
      <small></small>
    </div>

    <div>
      <Button @click="login" :disabled="loading || !user.id || !user.password"  :loading label="Login" icon="pi pi-sign-in" fluid />
    </div>
  </div>
</template>