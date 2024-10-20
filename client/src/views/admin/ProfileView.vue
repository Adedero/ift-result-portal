<script setup>
import { useRouter } from 'vue-router';
import useFetch from '../../composables/fetch/use-fetch';
import { useToast } from 'primevue/usetoast';
const router = useRouter();
const toast = useToast();
const { data: user, error } = await useFetch("admin/profile", { router, toast });

</script>

<template>
  <section class="h-full">
    <header class="bg-white border-y px-5 py-2 flex items-center gap-2 justify-between flex-wrap">
      <p class="font-semibold">Profile</p>
    </header>

    <div class="max-h-[calc(100%-4rem)] overflow-y-auto px-2 md:px-5 py-4">
      <ServerError v-if="error" :error="error" reloadOnRetry />
      <VProfile v-if="user" :user="user" role="admin" />
    </div>
  </section>
</template>