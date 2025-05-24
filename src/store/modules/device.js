import api from "@/config/axios";
// Uradi funckionalnost promene statusa uredjaja iz 0 u 1 i obrnuto!
export default {
    namespaced: true,
    state: () => ({
        device: null,
        deviceForTemperature : null
    }),
    getters: {
        getAllDevices(state) {
            return state.device;
        },
        getDeviceOfTemperatureForSelectedType(state){
            return state.deviceForTemperature;
        }
    },
    mutations: {
        setDevice(state, payload) {
            state.device = payload;

        },
        setDeviceForTemperature(state,payload){
            state.deviceForTemperature = payload;
        },
        updateDevice(state, updatedDevice) {
            const index = state.device.findIndex(d => d.id === updatedDevice.id);
            if (index !== -1) {
                state.device.splice(index, 1, updatedDevice);
            }
        },
        updateDevices(state, updatedDevices) {
            updatedDevices.forEach(updated => {
                const index = state.device.findIndex(d => d.id === updated.id);
                if (index !== -1) {
                    state.device[index] = { ...state.device[index], ...updated };
                }
            });
        },
        addDevice(state, newDevice) {
            state.device.push(newDevice);
        },
    },
    actions: {
        async addDevice({dispatch,commit}, payload) {
            const response = await api.post('/api/device', payload);

            commit('addDevice',response.data.device);
            dispatch('group/assignDevicesToGroups',null,{root:true});
            // dispatch("group/getAllGroup", null, { root: true });
            return response;
        },
        async getAllDevices({ commit },typeId = null) {
            try {
                let response = null;
                if(typeId !== null){
                    response = await api.get(`/api/device?typeId=${typeId}`);
                }
                else{
                    response = await api.get('/api/device');
                }
                commit('setDevice', response.data.devices);
                return response.data.devices;
            }
            catch (error) {
                throw Error(error);
            }
        },
        async changeStatusOfDevice({ dispatch,commit }, { id, status,pin }) {
            try {
                const response = await api.get(`/api/device/status/${id}?status=${Number(status)}&pin=${pin}`);
                commit("updateDevice",response.data);
                dispatch('group/assignDevicesToGroups',null,{root:true});
                return response;
            }
            catch (error) {
                throw Error(error);
            }

        },
        async changeStautsOfDeviceInGroup({ dispatch,commit }, { id, status,ids }) {
            try {
                const response = await api.patch(`/api/device/group/${id}`,{ status,ids });
                const updatedDevices = response.data.devices;
                commit("updateDevices", updatedDevices);
                dispatch('group/assignDevicesToGroups',null,{root:true});
                return response;
            }
            catch (error) {
                if (error.response) {
                    console.error("Response error:", error.response.status, error.response.data);
                } else {
                    console.error("Network error:", error.message);
                }

                throw Error(error);
            }
        },
        async changeNameOfDevice({ dispatch }, { id, name }) {
            try {

                const response = await api.patch(`/api/device/name/${id}`, { name });
                await dispatch("getAllDevices");
                await dispatch('group/assignDevicesToGroups',null,{root:true});
                return response;
            }
            catch (error) {
                if (error.response) {
                    console.error("Response error:", error.response.status, error.response.data);
                } else {
                    console.error("Network error:", error.message);
                }

                throw Error(error);
            }
        },
        async deleteDevice({ dispatch }, { id }) {
            try {
                const response = await api.delete(`/api/device/${id}`);
                await dispatch("group/getAllGroup", null, { root: true });
                await dispatch("getAllDevices");
                return response;
            }
            catch (error) {
                throw Error(error);
            }
        },
        async changeBrightnessForDevice({dispatch},{id,brightness}){
            try {
                const response = await api.patch(`/api/device/${id}`, {brightness});
                await dispatch("group/getAllGroup", null, {root: true});
                await dispatch("getAllDevices");
                return response;
            }
            catch(error){
                throw Error(error);
            }
        },
        async getAllDevicesForTemperature({commit},type){
            try {
                const response = await api.get(`/api/devicesWithTermostat?type=${type}`);
                commit('setDeviceForTemperature',response.data.data);
                return response;
            }
            catch(error){
                throw Error(error);
            }
        },
        async setDataOfDeviceForTemperature({commit},payload){
            try {
                const response = await api.post(`/api/setDataOfDeviceForTemperature/${payload.id}`,payload.data);
                commit('setDeviceForTemperature',response.data.data);
                return response;
            }
            catch(error){
                throw Error(error);
            }
        }
    },
};