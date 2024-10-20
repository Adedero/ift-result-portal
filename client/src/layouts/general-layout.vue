<script setup>
import bg_image from "@/assets/bg-image-2.png";
import futo_logo from "@/assets/futo-logo.svg";
</script>
<template>
  <main class="h-dvh w-full grid md:flex md:items-center md:justify-center">
    <section class="w-full h-full p-5 md:max-w-96 lg:max-w-[26rem] xl:max-w-[28rem] lg:p-10 bg-gradient-to-b from-[--p-primary-200] to-white to-[60%]">
      <header class="flex items-center gap-2 py-5">
        <img :src="futo_logo" alt="FUTO logo" width="40">
        <div class="text-[0.8rem]">
          <h1 class="font-semibold">Department of Information Technology</h1>
          <p class="text-xs">Federal University of Technology, Owerri</p>
        </div>
      </header>
      <RouterView />
    </section>

    <section class="hidden h-full bg-[#FDFDFD] overflow-hidden md:grid md:items-end md:flex-grow">
      <img :src="bg_image" alt="background-image" class="w-full">
    </section>
  </main>
</template>