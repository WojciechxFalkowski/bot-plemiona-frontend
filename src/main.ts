import './assets/main.css'
import "vue3-snackbar/styles";

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { clerkPlugin } from '@clerk/vue'
import { SnackbarService, Vue3Snackbar } from 'vue3-snackbar'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(clerkPlugin, {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
})
app.use(SnackbarService)
app.component('vue3-snackbar', Vue3Snackbar)

app.mount('#app')
