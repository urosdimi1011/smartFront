import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import router from './router'
import store from './store'
import 'primeicons/primeicons.css';
import Toast from 'vue-toastification';
import Button from './components/ui/ButtonMy.vue';
import 'vue-toastification/dist/index.css';
import './registerServiceWorker'
import Vue3TouchEvents from 'vue3-touch-events';


// import Toast from "vue-toastification"
const app = createApp(App);
app.component('ButtonMy', Button);
app.use(Toast);
app.use(Vue3TouchEvents);
app.use(PrimeVue,{
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: false,
            cssLayer: false
        }
    }
 });
app.use(store).use(router).mount('#app')
