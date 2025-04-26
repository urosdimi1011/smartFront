import api from "@/config/axios";

export default {
    namespaced: true,
    state: () => ({
        termostats : null
    }),
    getters: {
        getListOfTermostat(state){
            return state.termostats;
        }
    },
    mutations: {
        setTermostat: (state,data)=>{
            state.termostats = data;
        }
    },
    actions: {
        async getAll({commit}){
            try{
                const response = await api.get('/api/termostat');
                commit('setTermostat',response.data.termostats);
                return response.data.termostats;
            }
            catch(error){
                throw Error(error.message);
            }
        },
        async addTermostat(_dispatch,payload) {
            try {
                return await api.post(`/api/termostat`, payload);
            } catch (error) {
                throw Error(error.message);
            }
        },
        async addTermostatToDevice(_dispatch,payload){
            try{
                return await api.post(`/api/termostat/${payload.idTermostat}`,{idDevice:payload.id});
            }
            catch(error){
                throw Error(error.message);
            }
        }
    },
};