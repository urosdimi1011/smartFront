import axios from "axios";
import store from "@/store"; // Importuj Vuex store
import { useToast } from "vue-toastification";
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

//https://smarteraback.razmenidom.com
//https://klikcontrol.rs

const instance = axios.create({
  baseURL: "http://localhost:8000", // Ovde stavite svoju osnovnu URL adresu
  timeout: 20000, // Timeout za zahteve (10 sekundi)
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (config) => {
    const apiKey = process.env.VUE_APP_API_KEY;
    if (apiKey) {
      config.headers["X-API-Key"] = apiKey;
    }

    const token = JSON.parse(localStorage.getItem("token"));

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url.includes("/api/refresh") ||
        originalRequest.url.includes("/api/login")
      ) {
        return Promise.reject(error);
      }

      const token = localStorage.getItem("token");

      if (!token) {
        await store.dispatch("user/logout");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        console.log("Refresh u toku, dodajem zahtev u queue...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      console.log("Pokrećem refresh token...");

      try {
        const refreshResponse = await store.dispatch("user/refreshToken");

        if (refreshResponse) {
          const newToken = store.state.user.jwt_token;

          console.log("Refresh uspešan, novi token dobijen");

          // Ažuriraj token u localStorage
          localStorage.setItem("token", JSON.stringify(newToken));

          // Ažuriraj header za originalni zahtev
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

          // Procesuiraj sve zahteve iz queue-a
          processQueue(null, newToken);

          // Ponovi originalni zahtev
          return instance(originalRequest);
        }
      } catch (refreshError) {
        processQueue(new Error("Refresh failed"), null);
        await store.dispatch("user/logout");
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
    // Ako token nije validan i već nije pokušano
    // if (
    //     error.response &&
    //     error.response.status === 401 &&
    //     !originalRequest._retry &&
    //     !originalRequest.url.includes("/api/refresh")
    //     && !isRefreshing && localStorage.getItem('token')
    // ) {
    //     originalRequest._retry = true;
    //     try {
    //         const refreshResponse = await store.dispatch("user/refreshToken");

    //         if (refreshResponse) {
    //             // Ažuriraj Authorization zaglavlje i ponovi zahtev
    //             originalRequest.headers["Authorization"] = `Bearer ${store.state.user.jwt_token}`;
    //             return axios(originalRequest);
    //         } else {
    //             // Ako refresh nije uspeo, logout
    //             isRefreshing = true;
    //             await store.dispatch("user/logout");
    //             return Promise.reject(error);
    //         }
    //     } catch (e) {
    //         // Ako refreshToken padne, logout
    //         await store.dispatch("user/logout");
    //         return Promise.reject(e);
    //     }
    // }
    // return Promise.reject(error);
  }
);

export default instance;
