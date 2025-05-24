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
                throw Error(error.response.data.message);
            }
        },
        async getAll({commit}){
            try{
                const response = await api.get('/api/timer');
                commit('setTimer',response.data.timers);
                return response;
            }
            catch(error){
                throw Error(error.response.data.message);
            }
        },
        async changeTimer({dispatch},payload){
            try{
                const response = await api.put(`/api/timer/${payload.id}`,payload);
                await dispatch("getAll");
                return response;
            }
            catch(error){
                throw Error(error.response.data.message);
            }
        },
        async changeActivity({dispatch},payload){
            try{
                const response = await api.put(`/api/timer/activity/${payload.id}`,payload);
                await dispatch("getAll");
                return response;
            }
            catch(error){
                throw Error(error.response.data.message);
            }
        },
        async deleteTimer({dispatch},payload){
            try{
                const response = await api.delete(`/api/timer/${payload.id}`);
                await dispatch("getAll");
                return response;
            }
            catch(error){
                throw Error(error.response.data.message);
            }
        },
        async deleteTimers({dispatch},payload){
            try{
                const response = await api.delete(`/api/timers`,{
                    data: {ids : payload}
                });
                await dispatch("getAll");
                return response;
            }
            catch(error){
                throw Error(error.response.data.message);
            }
        }
     
    },
};