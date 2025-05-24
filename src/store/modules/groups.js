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
        getAllFilterGroup: (state,getters, rootState, rootGetters) => (id) => {
            const allDevices = rootGetters['device/getAllDevices'];
            // Ovde u memoriji filtriramo grupe sa odredjenim id-jevima kategorija za uredjaje!
            if (!state.groups || state.groups.length === 0) {
                return []; 
            }
            if(allDevices) {
                return state.groups
                    .map(group => {
                        const filteredDevices = allDevices.filter(device =>
                            device.id_category === parseInt(id) && device.groups.some(g => g.id === group.id)
                        );
                        if (filteredDevices.length > 0) {
                            //Ovako gazim devices propery u group objektu!
                            return {...group, devices: filteredDevices};
                        }
                        return null;
                    })
                    .filter(group => group !== null);
            }
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
        },
        removeGroupById(state, id) {
            state.groups = state.groups.filter(group => group.id !== id);
        },
        addGroup(state, newGroup) {
            state.groups.push(newGroup);
        },
        updateGroupName(state, updatedGroup) {
            const group = state.groups.find(g => g.id === updatedGroup.id);
            if (group) {
                group.name = updatedGroup.name;
            }
        }
    },
    actions: {
        async addGroup({ dispatch,commit }, payload) {
            try {
                const response = await api.post('/api/groups', payload, {
                    validateStatus: (status) => status < 300
                });
                commit('addGroup',response.data.group);
                return response;
            }
            catch (error) {
                throw Error(error.response.data.message);
            }
        },
        async getAllGroup({commit,dispatch }, id = null) {
            try {
                let response = null;
                if (id == null) {
                    response = await api.get('/api/groups');
                    commit('setGroups', response.data.groups);
                    dispatch('assignDevicesToGroups');
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
                throw Error(error.response.data.message);
            }
        },
        async assignDevicesToGroups({ rootState, commit }) {
            const groups = rootState.group.groups;
            const allDevices = rootState.device.device;
            const enrichedGroups = groups.map(group => {
                return {
                    ...group,
                    devices: (allDevices && allDevices.length) ? allDevices.filter(device =>  device.groups && device.groups.some(g => g.id === group.id)): null
                };
            });
            console.log(enrichedGroups);
            commit('setGroups', enrichedGroups);
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
                await dispatch('device/getAllDevices', null, { root: true });
                await dispatch('assignDevicesToGroups');
                return response.data;
            }
            catch (error) {
                throw Error(error.response.data.message);
            }
        },
        async RemoveGroup({ dispatch,commit }, id) {
            try {
                const response = await api.delete(`/api/groups/${id}`);
                commit('removeGroupById',id);
                dispatch('assignDevicesToGroups');
                return response.data;
            }
            catch (error) {
                throw Error(error.response.data.message);
            }
        },
        async changeGroupName({commit},payload){
            try {
                const response = await api.patch(`/api/group/${payload.id}`, {"name": payload.name});
                commit('updateGroupName',response.data);
                return response
            }
            catch (error) {
                throw Error(error.response.data.message);
            }
        }
    },
};