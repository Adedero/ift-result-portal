<script setup>
import futo_logo from "@/assets/futo-logo.svg";
</script>

<template>
  <header class="p-5 border border-b flex items-center gap-2 justify-between">
    <RouterLink to="/">
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
    </RouterLink>

    <div class="flex items-center gap-2">
      <Button label="Login" icon="pi pi-sign-in" icon-pos="right" size="small" />
      <Button label="Register" icon="pi pi-user-plus" outlined icon-pos="right" size="small" />
    </div>
  </header>
</template>