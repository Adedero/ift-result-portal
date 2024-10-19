import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";

export const primevueOptions = {
  ripple: true,
  prefix: "p",
  darkModeSelector: "class",
  cssLayer: {
    name: "primevue",
    order: "tailwind-base, primevue, tailwind-utilities"
  }
}

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{emerald.50}",
      100: "{emerald.100}",
      200: "{emerald.200}",
      300: "{emerald.300}",
      400: "{emerald.400}",
      500: "{emerald.500}",
      600: "{emerald.600}",
      700: "{emerald.700}",
      800: "{emerald.800}",
      900: "{emerald.900}",
      950: "{emerald.950}"
    }
  }
});


