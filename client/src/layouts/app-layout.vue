<script setup>
import { ref } from "vue";
import useUserStore from "@/stores/user.store";
import futo_logo from "@/assets/futo-logo.svg";

const userStore = useUserStore();
const isNavbarOpen = ref(localStorage.getItem("isNavbarOpen") === "true");

const setIsNavbarOpen = (state) => {
  localStorage.setItem("isNavbarOpen", state ? "true" : "false");
  isNavbarOpen.value = state;
};

const closeNavbar = () => setIsNavbarOpen(false);
const toggleNavbar = () => setIsNavbarOpen(!isNavbarOpen.value);
</script>

<template>
  <section class="w-full h-dvh lg:flex lg:items-center">
    <nav class="nav" :class="{ 'open': isNavbarOpen }">
      <slot name="navbar" :closeNavbar></slot>
    </nav>
    <div @click="closeNavbar" class="overlay" :class="{ 'open': isNavbarOpen }"></div>

    <section class="h-dvh w-full">
      <header class="h-16 p-2 flex gap-2 items-center md:gap-4 md:p-5">
        <Button @click="toggleNavbar" icon="pi pi-bars" outlined class="order-3 lg:order-1" />

        <div class="flex items-center gap-2 lg:order-2">
          <img :src="futo_logo" alt="FUTO logo" width="40">
          <div class="text-[0.8rem] md:hidden">
            <h1 class="font-semibold">IFT Dept.</h1>
            <p class="text-xs">FUTO</p>
          </div>
          <div class="text-[0.8rem] hidden md:block">
            <h1 class="font-semibold">Department of Information Technology</h1>
            <p class="text-xs">Federal University of Technology, Owerri</p>
          </div>
        </div>

        <div class="ml-auto lg:order-3">
          <VAvatar :user="userStore.user" class="w-10 h-10" add-details />
        </div>
      </header>

      <section class="h-[calc(100dvh-4rem)] w-full overflow-y-auto">
        <slot name="content"></slot>
      </section>
    </section>
  </section>
</template>

<style scoped>
.overlay {
  @apply transition-all fixed h-dvh w-0 top-0 left-0 bg-black/20 backdrop-blur-sm z-10 lg:hidden
}

.overlay.open {
  @apply w-dvw
}

.nav {
  @apply transition-all bg-white fixed h-dvh w-0 top-0 left-0 overflow-hidden lg:relative z-20
}

.nav.open {
  @apply w-[min(80dvw,20rem)] lg:w-[22rem]
}
</style>