import api from "@/config/axios";
import router from "@/router";
import axios from "axios";

export default {
  namespaced: true,
  state: () => ({
    user: null,
    jwt_token: localStorage.getItem("token") || null,
  }),
  getters: {
    getUser(state) {
      console.log(state);
      if (localStorage.getItem("user")) {
        return JSON.parse(localStorage.getItem("user"));
      }
      return state.user;
    },
    getJwtToken(state) {
      return state.jwt_token;
    },
    isAuthenticated: (state) => !!state.jwt_token,
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
      localStorage.setItem("user", JSON.stringify(payload));
    },
    setJwtToken(state, payload) {
      state.jwt_token = payload;
      localStorage.setItem("token", JSON.stringify(payload));
    },
    removeToken(state) {
      state.user = null;
      state.jwt_token = null;
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    logout(state) {
      state.user = null;
      state.jwt_token = null;
    },
  },
  actions: {
    async loginUser({ commit }, payload) {
      try {
        const response = await api.post("/api/login", payload);
        const userInfo = response.data.user;
        const token = response.data.token;
        commit("setUser", userInfo);
        commit("setJwtToken", token);
      } catch (error) {
        throw Error(error.response.data.message);
      }
    },
    async changeUserPassword(_commit, dataForSend) {
      const { data } = await api.patch(`/api/changePassword`, {
        ...dataForSend,
      });
      return data;
    },
    async logout({ commit, state }) {
      try {
        await axios.post(
          "http://127.0.0.1:8000/api/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${state.jwt_token}`,
              "X-API-Key": process.env.VUE_APP_API_KEY,
            },
          }
        );
      } catch (error) {
        throw Error(error);
      } finally {
        await commit("removeToken");
        await commit("group/resetState", null, { root: true });
        await commit("device/resetState", null, { root: true });
        await router.push("/login");
      }
    },
    async validateToken({ _commit }, data) {
      const token = await api.get("/api/reset-password", { params: data });
      return token;
    },
    async changePassword({ _commit }, data) {
      const response = await api.patch("/api/changePass", data);
      return response;
    },
    async registerUser(_commit, payload) {
      try {
        const response = await api.post("/api/register", payload);
        return response.data;
      } catch (error) {
        throw Error(error.response.data.message);
      }
    },
    async refreshToken({ commit, state }) {
      try {
        const jwt= JSON.parse(localStorage.getItem("token"));
        const response = await axios.post(
          "http://127.0.0.1:8000/api/refresh",
          {},
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
              "X-API-Key": process.env.VUE_APP_API_KEY,
            },
          }
        );
        commit("setJwtToken", response.data.token);
        return true;
      } catch (error) {
        commit("removeToken");
        router.push("/login");
        return false;
      }
    },
  },
};
