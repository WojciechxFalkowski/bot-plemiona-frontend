import './assets/main.css'
import "vue3-snackbar/styles";
import './firebaseConfig';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { clerkPlugin } from '@clerk/vue'
import { SnackbarService, Vue3Snackbar } from 'vue3-snackbar'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
const VITE_CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

app.use(clerkPlugin, {
  publishableKey: VITE_CLERK_PUBLISHABLE_KEY,
})
app.use(SnackbarService)
app.component('vue3-snackbar', Vue3Snackbar)
app.use(ui)
app.mount('#app')
