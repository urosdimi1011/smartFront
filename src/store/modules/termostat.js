import api from "@/config/axios";

export default {
    namespaced: true,
    state: () => ({
        termostats : null
    }),
    getters: {
        getListOfTermostat(state){
            return state.timer;
        }
    },
    mutations: {
        setTimer: (state,data)=>{
            state.timer = data;
        }
    },
    actions: {
        async getAll({commit}){
            try{
                const response = await api.get('/api/termostat');
                commit('setTimer',response.data.timers);
                return response;
            }
            catch(error){
                throw Error(error.message);
            }
        },
        async addTermostat({dispatch},payload){
            try{
                const response = await api.post(`/api/termostat/${payload.id}`,payload);
                await dispatch("getAll");
                return response;
            }
            catch(error){
                throw Error(error.message);
            }
        },
        async deleteTimer({dispatch},payload){
            try{
                const response = await api.delete(`/api/timer/${payload.id}`);
                await dispatch("getAll");
                return response;
            }
            catch(error){
                throw Error(error.message);
            }
        }
     
    },
};