import axios from 'axios';
import store from '@/store'; // Importuj Vuex store
import {useToast} from "vue-toastification";
const toast= useToast();
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};
const instance = axios.create({
    baseURL: 'https://smarteraback.razmenidom.com',  // Ovde stavite svoju osnovnu URL adresu
    timeout: 20000,  // Timeout za zahteve (10 sekundi)
    headers: {
        'Content-Type': 'application/json',
    }
});

// Znaci ovo su presetraci zahteva!
instance.interceptors.request.use(config => {
    //ovo moze da bude problem???
    const token = JSON.parse(localStorage.getItem('token'));

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
}, error => {
    return Promise.reject(error);
});
instance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Ako token nije validan i već nije pokušano
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/api/refresh")
            && !isRefreshing
        ) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await store.dispatch("user/refreshToken");

                if (refreshResponse) {
                    // Ažuriraj Authorization zaglavlje i ponovi zahtev
                    originalRequest.headers["Authorization"] = `Bearer ${store.state.user.jwt_token}`;
                    return axios(originalRequest);
                } else {
                    // Ako refresh nije uspeo, logout
                    isRefreshing = true;
                    await store.dispatch("user/logout");
                    return Promise.reject(error);
                }
            } catch (e) {
                // Ako refreshToken padne, logout
                await store.dispatch("user/logout");
                return Promise.reject(e);
            }
        }
        toast.error(error);
        return Promise.reject(error);
    }
);


export default instance;