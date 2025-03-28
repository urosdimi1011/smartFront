import axios from 'axios';
import store from '@/store'; // Importuj Vuex store

const instance = axios.create({
    baseURL: 'https://smarteraback.razmenidom.com',  // Ovde stavite svoju osnovnu URL adresu
    timeout: 10000,  // Timeout za zahteve (10 sekundi)
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
instance.interceptors.response.use(response => response, async error => {
    if (error.response && error.response.status === 401 && localStorage.getItem('token')) {
        try {
            const refreshResponse = await store.dispatch('user/refreshToken');
            if (refreshResponse) {
                error.config.headers["Authorization"] = `Bearer ${store.state.user.jwt_token}`;
                return axios.request(error.config);
            }
            else {
                store.dispatch("user/logout");
                return Promise.reject(error);
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    return Promise.reject(error);
})
export default instance;