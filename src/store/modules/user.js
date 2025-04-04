import api from "@/config/axios";
import router from "@/router";

export default {
    namespaced: true,
    state: () => ({
        user: null,
        jwt_token: localStorage.getItem("token") || null
    }),
    getters: {
        getUser(state) {
            if (localStorage.getItem('user')) {
                return JSON.parse(localStorage.getItem('user'));
            }
            return state.user;
        },
        getJwtToken(state) {
            return state.jwt_token;
        },
        isAuthenticated: state => !!state.jwt_token,
    },
    mutations: {
        setUser(state, payload) {
            state.user = payload;
            localStorage.setItem('user', JSON.stringify(payload));

        },
        setJwtToken(state, payload) {
            state.jwt_token = payload
            localStorage.setItem('token', JSON.stringify(payload));

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
        }
    },
    actions: {
        async loginUser({ commit }, payload) {
            try {
                const response = await api.post('/api/login', payload);
                const userInfo = response.data.user;
                const token = response.data.token;
                commit('setUser', userInfo);
                commit('setJwtToken', token);
            }
            catch (error) {
                throw Error(error.response.data.message);
            }
        },
        async changeUserPassword(_commit,idUser) {
            try {
                await api.patch(`/api/changePassword/${idUser}`);
            }
            catch (error) {
                throw Error(error.response.data.message);
            }
        },
        async logout({ commit }) {
            try {
                await api.post("/api/logout");
            } catch (error) {
                throw Error(error);
            }
            commit("removeToken");
            await router.push("/login");
            },
        async registerUser(_commit, payload) {
            try {
                const response = await api.post('/api/register', payload);
                return response.data;
            }
            catch (error) {
                throw Error(error.response.data.message);

            }
            // commit('setUser',user);
        },
        async refreshToken({ commit }) {
            try {
                const response = await api.post("/api/refresh");
                commit('setJwtToken', response.data.token)
                return true;

            }
            catch (error) {
                router.push("/login");
                commit("removeToken");
                return false;
            }
        }
    },
};