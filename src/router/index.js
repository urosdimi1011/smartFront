import { createRouter, createWebHistory } from 'vue-router'
// import store from '@/store';
const routes = [
  { path: '/', component: () => import('../views/HomeView.vue'), name: 'Home', meta: { requiresAuth: true } },
  { path: '/plug/:idCategories?', component: () => import('../views/PlugView.vue'), name: 'Plug', meta: { requiresAuth: true }, props: true },
  { path: '/light/:idCategories?', component: () => import('../views/LightView.vue'), name: 'Light', meta: { requiresAuth: true }, props: true },
    { path: '/temperature', component: () => import('../views/TemperatureView.vue'), name: 'Temperature', meta: { requiresAuth: true }, props: true },
  { path: '/login', component: () => import('../views/LoginView.vue'), name: 'Login', props: true },
  { path: '/register', component: () => import('../views/RegisterView.vue'), name: 'Register', props: true },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFound.vue') }

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }; // Vraća na vrh sa glatkim skrolovanjem
  }
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token');
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/');
  } else {
    next();
  }
  console.log(isAuthenticated);
});
export default router
