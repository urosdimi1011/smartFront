import api from "@/config/axios";

export default {
    namespaced: true,
    state: () => ({
        timer : null
    }),
    getters: {
        getListOfTimer(state){
            return state.timer;
        }
    },
    mutations: {
        setTimer: (state,data)=>{
            state.timer = data;
        }
    },
    actions: {
        async setTimer(_commit, payload) {
            try{
                const response = await api.post('/api/timer',payload);
                return response;
            }
            catch(error){
                throw Error(error.message);
            }
        },
        async getAll({commit}){
            try{
                const response = await api.get('/api/timer');
                commit('setTimer',response.data.timers);
                return response;
            }
            catch(error){
                throw Error(error.message);
            }
        },
        async changeTimer({dispatch},payload){
            try{
                const response = await api.put(`/api/timer/${payload.id}`,payload);
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