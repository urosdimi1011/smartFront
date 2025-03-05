import api from "@/config/axios";

export default {
    namespaced: true,
    state: () => ({
        user: null,
        jwt_token: localStorage.getItem("token") || null
    }),
    getters: {
        getUser(state) {
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
            localStorage.setItem('user',JSON.stringify(payload));

        },
        setJwtToken(state, payload) {
            state.jwt_token = payload
            localStorage.setItem('token',JSON.stringify(payload));

        },
        removeToken(state) {
            state.user = null;
            state.jwt_token = null;
            delete api.defaults.headers.common["Authorization"];
            localStorage.removeItem("token");

        },
        logout(state) {
            state.user = null;
            state.jwt_token = null;
        }
    },
    actions: {
        async loginUser({commit}, payload) {
            try{
                const response = await api.post('/api/login',payload);
                const userInfo = response.data.user;
                const token = response.data.token;
                
                // if(!localStorage.getItem('user') && !localStorage.getItem('token')){
                //     localStorage.setItem('user',JSON.stringify(userInfo));
                //     localStorage.setItem('token',JSON.stringify(token));
                // }
                commit('setUser',userInfo);
                commit('setJwtToken',token);
            }
            catch(error){
                if(error.status === 401){
                    throw Error("Email ili password nije dobar");
                }
                else{
                    throw Error(error.data.message);
                }
            }
            // commit('setUser',user);
        },
        async logout({ commit }) {
            try {
              await api.post("/logout");
            } catch (error) {
              console.error("Greška pri odjavi:", error);
            }
            commit("removeToken");
          },
        async registerUser(_commit, payload) {
            try{
                const response = await api.post('/api/register',payload);
                return response.data;
            }
            catch(error){
                if(error.status==500){
                    throw Error(error.status);
                }
                throw Error(error.message);
            }
            // commit('setUser',user);
        },
        async refreshToken({commit}){
            try{
                const response = await api.post("/api/refresh");
                commit('setJwtToken',response.data.token)
                return true;

            }
            catch(error){
                console.error("Greška pri osvežavanju tokena:", error);
                commit("removeToken");
                return false;
            }
        }
    },
};