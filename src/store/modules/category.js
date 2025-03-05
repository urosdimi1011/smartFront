import api from "@/config/axios";

export default {
    namespaced: true,
    state: () => ({
        categories : null
    }),
    getters: {
        getListOfCategories(state){
            return state.categories;
        }
    },
    mutations: {
        setCategories: (state,data)=>{
            state.categories = data;
        }
    },
    actions: {
        async getAll({commit}){
            // try{
                const response = await api.get('/api/categories'); 
                commit('setCategories',response.data.categories);
                return response;
            // }
            // catch(error){
                // throw error;
            // }
        }
     
    },
};