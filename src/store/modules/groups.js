import api from "@/config/axios";
import {getItem, setItem} from "@/config/indexedDB";

export default {
    namespaced: true,
    state: () => ({
        groups: null,
        filterGroups: null
    }),
    getters: {
        getAllGroups(state) {
            return state.groups;
        },
        getAllFilterGroup: (state) => (id) => {
            // Ovde u memoriji filtriramo grupe sa odredjenim id-jevima kategorija za uredjaje!
            if (!state.groups || state.groups.length === 0) {
                return []; 
            }
            return state.groups
            .map(group => {
                const filteredDevices = group.devices.filter(device => device.id_category === parseInt(id));
                if (filteredDevices.length > 0) {
                    //Ovako gazim devices propery u group objektu!
                    return { ...group, devices: filteredDevices };
                }
                return null;
            })
            .filter(group => group !== null);
        },
        getAllDevicesOfGroup: (state) => (idGroup) => {
            const groups = state.groups.find((x) => x.id === idGroup);
            if (groups) {
                return state.groups.find((x) => x.id === idGroup).devices.map((x) => x.id);
            }
            return state.groups.find((x) => x.id === idGroup);
        }
    },
    mutations: {
        setGroups(state, payload) {
            state.groups = payload;
        },
        setFilterGroups(state, payload) {
            state.filterGroups = payload;
        },
        updateGroupsOrder(state,newOrder){
            state.groups = newOrder;
        }
    },
    actions: {
        async addGroup({ dispatch }, payload) {
            try {
                const response = await api.post('/api/groups', payload, {
                    validateStatus: (status) => status < 300
                });
                dispatch('getAllGroup');
                // commit('setUser',response.data.user);
                // commit('setJwtToken',response.data.token);
                return response;
            }
            catch (error) {
                throw Error(error);
            }
            // commit('setUser',user);
        },
        async getAllGroup({commit,dispatch }, id = null) {
            try {
                let response = null;
                if (id == null) {
                    response = await api.get('/api/groups');
                    commit('setGroups', response.data.groups);
                    dispatch('filteringOrderInNewGroups',response.data.groups);
                }
                else {
                    response = await api.get("/api/groups?idCategory=" + parseInt(id));
                    commit('setFilterGroups', response.data.groups);
                }
                if (response) {
                    return response.data;
                }
            }
            catch (error) {
                console.log(error);
                throw Error(error.message);
            }
        },
        async setLocalItemFromIndexedDb({commit},payload){
            await setItem('localItems',payload);
            commit('setGroups', payload);
        },
        async filteringOrderInNewGroups({dispatch},newGroups){
            const groups = await getItem('localItems');
            if(groups && groups.length){
                let updatedGroups = groups
                    .filter(oldGroup => newGroups.some(newG => {
                        return newG.id === oldGroup.id
                    }))
                    .map(oldGroup => newGroups.find(newG => newG.id === oldGroup.id));
                let newEntries = newGroups.filter(newG => !groups.some(oldG => oldG.id === newG.id));
                dispatch('setLocalItemFromIndexedDb',[...updatedGroups, ...newEntries]);
            }
            else{
                dispatch('setLocalItemFromIndexedDb',newGroups);
            }
        },
        async AddDevicesInGroup({ dispatch }, payload) {
            const id = payload.id;
            const ids = payload.devices;
            // console.log(id,{ids});
            try {
                const response = await api.post(`/api/groups/${id}`, { ids });
                dispatch('getAllGroup');
                return response.data;
            }
            catch (error) {
                throw Error(error.message);
            }
        },
        async RemoveGroup({ dispatch }, id) {
            try {
                const response = await api.delete(`/api/groups/${id}`);
                dispatch('getAllGroup');
                return response.data;
            }
            catch (error) {
                throw Error(error.message);
            }
        },
        async changeGroupName({dispatch},payload){
            try {
                const response = await api.patch(`/api/group/${payload.id}`, {"name": payload.name});
                dispatch('getAllGroup');
                return response
            }
            catch (error) {
                throw Error(error.message);
            }
        }
    },
};