<template>
  <section class="pt-4">
    <h1 class="font-semibold text-4xl">Register</h1>
    <small>Welcome! Enter your registration PIN to continue.</small>

    <div class="mt-4 w-full">
      <RegisterForm />
    </div>


    <div class="mt-5 text-sm">
      <p>Already got an account?
        <RouterLink to="/"
          class="font-semibold hover:underline text-[--p-primary-500] hover:text-[--p-primary-600]">
          Log in
        </RouterLink>.
      </p>
    </div>
  </section>
</template>