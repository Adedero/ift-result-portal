import { createApp } from "vue";
import PrimeVue from "primevue/config";
import "./style.css";
import "primeicons/primeicons.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { MyPreset, primevueOptions } from "./config/primevue.config";
import ToastService from 'primevue/toastservice';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: primevueOptions
  }
});
app.use(ToastService);

app.mount("#app");