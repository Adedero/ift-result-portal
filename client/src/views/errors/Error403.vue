<template>
  <section>
    <ErrorHeader />

    <div class="grid place-content-center text-center">
      <div class="text-center">
        <h1 class="text-[8rem] md:text-[10rem] font-extralight">403</h1>
        <p class="text-2xl font-light tracking-wide -translate-y-10">NOT ALLOWED!</p>
      </div>
      <p>You are not authorized to view this page. <br> If you are not logged in, do so before you continue.</p>
      <div class="mt-3 flex items-center justify-center gap-3">
        <Button @click="$router.push('/')" label="Log in" severity="primary" icon="pi pi-sign-in" />
        <Button @click="$router.back('/register')" label="Register" severity="contrast" icon="pi pi-user-plus" />
      </div>
    </div>
  </section>
</template>