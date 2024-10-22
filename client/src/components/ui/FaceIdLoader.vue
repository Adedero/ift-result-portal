<template>
  <div class="w-full h-60 gap-2 flex flex-col items-center justify-center">
    <div class="loader"></div>
  </div>
</template>

<style scoped>
.loader {
  width: 17px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--p-primary-500);
  display: grid;
  animation: l22-0 2s infinite linear;
}

.loader:before,
.loader:after {
  content: "";
  grid-area: 1/1;
  margin: 15%;
  border-radius: 50%;
  background: inherit;
  transform: rotate(0deg) translate(150%);
  animation: l22 1s infinite;
}

.loader:after {
  animation-delay: -.5s
}

@keyframes l22-0 {
  100% {
    transform: rotate(1turn)
  }
}

@keyframes l22 {
  100% {
    transform: rotate(1turn) translate(150%)
  }
}
</style>