<template>
  <section>
    <ErrorHeader />

    <div class="grid place-content-center text-center">
      <div class="text-center">
        <h1 class="text-[8rem] md:text-[10rem] font-extralight">404</h1>
        <p class="text-2xl font-light tracking-wide -translate-y-10">PAGE NOT FOUND</p>
      </div>
      <p>The page you are looking for does not exist <br> or may have been moved.</p>
      <div class="mt-3 flex items-center justify-center gap-3">
        <Button @click="$router.back()" label="Go back" severity="contrast" icon="pi pi-arrow-left" />
        <Button @click="$router.push('/')" label="Go home" severity="primary" icon="pi pi-home" />
      </div>
    </div>
  </section>
</template>