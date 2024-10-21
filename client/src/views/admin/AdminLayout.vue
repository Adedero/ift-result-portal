<script setup>
import { ref } from "vue";
import AppLayout from "@/layouts/app-layout.vue";
import useUserStore from "@/stores/user.store";
import useSignOut from "@/composables/use-signout";
const userStore = useUserStore();


const links = ref([
  {
    heading: "General",
    items: [
      { id: 1, title: "Dashboard", icon: "pi pi-home", name: "admin-dashboard", params: {} },
      { id: 2, title: "Results", icon: "pi pi-book", name: "admin-results", params: {} }
    ]
  },
  {
    heading: "Users",
    items: [
      { id: 1, title: "Admins", icon: "pi pi-shield", name: "admin-admins", params: {} },
      { id: 2, title: "Staffs", icon: "pi pi-briefcase", name: "admin-staffs", params: {} },
      { id: 3, title: "Students", icon: "pi pi-users", name: "admin-students", params: {} },
    ]
  },
  {
    heading: "Settings",
    items: [
      { id: 1, title: "PINs", icon: "pi pi-key", name: "admin-pins", params: {} },
      { id: 2, title: "Biometrics", icon: "pi pi-eye", name: "admin-biometrics", params: {} },
      { id: 3, title: "Profile", icon: "pi pi-user", name: "admin-profile", params: {} },
    ]
  }
])
</script>

<template>
  <AppLayout>
    <template #navbar="{ closeNavbar }">
      <div class="h-full overflow-y-auto w-full border-r relative pb-5">
        <header class="pt-2 pb-4 flex flex-col items-center justify-center">
          <VAvatar :user="userStore.user" size="xlarge" class="w-20 h-20" height="100" width="100" />
          <div class="text-center">
            <h1 class="font-semibold">
              {{ userStore.user?.title ?? '' }} {{ userStore.user?.firstName ?? '' }} {{ userStore.user?.lastName ?? '' }}
            </h1>
            <p class="text-sm">{{ (userStore.user?.email ?? '') || (userStore.user?.username ?? '') }}</p>
            <p class="text-xs uppercase text-red-500">ADMININSTRATOR</p>
            <div v-if="!userStore.user.email" class="p-4">
              <VEmailNotifier />
            </div>
          </div>
        </header>
        <div class="px-5 grid">
          <div v-for="group in links" :key="group.heading">
            <h3 class="font-semibold text-[--p-primary-500] cursor-context-menu">{{ group.heading }}</h3>
            <div class="grid gap-1 text-slate-600">
              <RouterLink @click="closeNavbar()" v-for="link in group.items" :key="link.id" :to="{ name: link.name }"
                class="lg:hidden flex items-center gap-2 p-2 transition-colors rounded hover:bg-[--p-primary-50]">
                <span :class="link.icon"> </span>
                <span>{{ link.title }}</span>
              </RouterLink>

              <RouterLink v-for="link in group.items" :key="link.id" :to="{ name: link.name }"
                class="hidden lg:flex items-center gap-2 p-2 transition-colors rounded hover:bg-[--p-primary-50]">
                <span :class="link.icon"> </span>
                <span>{{ link.title }}</span>
              </RouterLink>
            </div>
            <Divider />
          </div>
        </div>

        <div class="w-full px-5">
          <Button @click="useSignOut($router)" label="Log out" icon="pi pi-sign-out" icon-pos="right" fluid />
        </div>
      </div>
    </template>

    <template #content>
      <Suspense>
        <template #default>
          <section class="bg-slate-100 h-full">
            <RouterView />
          </section>
        </template>

        <template #fallback>
          <div class="flex flex-col bg-slate-100 h-full items-center justify-center">
            <VLoader />
          </div>
        </template>
      </Suspense>

    </template>
  </AppLayout>
</template>

<style scoped>
a.router-link-exact-active {
  @apply bg-[--p-primary-50] text-[--p-primary-500] hover:bg-[--p-primary-100] hover:text-[--p-primary-600]
}
</style>