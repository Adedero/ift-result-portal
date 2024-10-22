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
      { id: 1, title: "Results", icon: "pi pi-book", name: "student-results" },
      { id: 2, title: "Course Registration", icon: "pi pi-file-edit", name: "course-registration" },
    ]
  },
  {
    heading: "Settings",
    items: [
      { id: 1, title: "Biometrics", icon: "pi pi-eye", name: "student-biometrics" },
      { id: 2, title: "Profile", icon: "pi pi-user", name: "student-profile" },
    ]
  }
])
</script>

<template>
  <AppLayout>
    <template #navbar="{ closeNavbar }">
      <div class="h-full overflow-y-auto w-full border-r relative">
        <header class="pt-2 pb-4 flex flex-col items-center justify-center">
          <VAvatar :user="userStore.user" size="xlarge" class="w-20 h-20" height="100" width="100" />
          <div class="text-center">
            <h1 class="font-semibold">
              {{ userStore.user?.firstName ?? '' }} {{ userStore.user?.lastName ?? '' }}
            </h1>
            <p class="text-sm">{{ userStore.user?.regNumber ?? '' }}</p>
            <p class="text-sm">Level: {{ userStore.user?.level ?? '' }}</p>
            <p class="text-xs uppercase text-red-500">SUDENT</p>
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

        <div class="absolute w-full bottom-5 left-0 px-5">
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