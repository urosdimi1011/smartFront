import { createRouter, createWebHistory } from 'vue-router'
// import store from '@/store';
const routes = [
  { path: '/', component: () => import('../views/HomeView.vue'), name: 'Home', meta: { requiresAuth: true } },
  { path: '/plug/:idCategories?', component: () => import('../views/PlugView.vue'), name: 'Plug', meta: { requiresAuth: true },props: true  },
  { path: '/light/:idCategories?', component: () => import('../views/LightView.vue'), name: 'Light', meta: { requiresAuth: true },props: true  },
  { path: '/temperature', component: () => import('../views/TemperatureView.vue'), name: 'Temperature', meta: { requiresAuth: true },props: true  },
  { path: '/login', component: () => import('../views/LoginView.vue'), name: 'Login',props: true  },
  { path: '/register', component: () => import('../views/RegisterView.vue'), name: 'Register',props: true  },

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  // const isAuthenticated = store.state.user.jwt_token;
  const isAuthenticated = localStorage.getItem('user');
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); // Ako nije ulogovan, preusmeri ga na login
  } else if (to.path === '/login' && isAuthenticated) {
    next('/'); // Ako je već ulogovan, ne treba mu login, šaljemo ga na Home
  } else {
    next(); // Ako je sve ok, nastavi dalje
  }
})

export default router
