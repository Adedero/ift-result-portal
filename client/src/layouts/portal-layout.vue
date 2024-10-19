<script setup>
import { onBeforeMount } from 'vue';
import useUserStore from '../stores/user.store';
import { useRoute } from 'vue-router';
onBeforeMount(() => {
  useUserStore().setUser(useRoute().params.userId)
})
</script>
<template>
  <RouterView />
</template>