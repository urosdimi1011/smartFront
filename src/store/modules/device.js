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
        }
    },
    actions: {
        async addDevice({dispatch}, payload) {
            const response = await api.post('/api/device', payload);
            dispatch("group/getAllGroup", null, { root: true });
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
                throw Error(error.message);
            }
        },
        async changeStatusOfDevice({ dispatch }, { id, status,pin }) {
            try {
                const response = await api.get(`/api/device/status/${id}?status=${Number(status)}&pin=${pin}`);
                // Da li ovo moze drugacije da se resi????
                await dispatch("group/getAllGroup", null, { root: true });
                await dispatch("getAllDevices");
                return response;
            }
            catch (error) {
                throw Error(error.message);

            }

        },
        async changeStautsOfDeviceInGroup({ dispatch }, { id, status,ids }) {
            try {
                const response = await api.patch(`/api/device/group/${id}`, { status,ids });
                await dispatch("group/getAllGroup", null, { root: true });
                await dispatch("getAllDevices");
                return response;
            }
            catch (error) {
                if (error.response) {
                    console.error("Response error:", error.response.status, error.response.data);
                } else {
                    console.error("Network error:", error.message);
                }

                throw Error(error.message);
            }
        },
        async changeNameOfDevice({ dispatch }, { id, name }) {
            try {

                const response = await api.patch(`/api/device/name/${id}`, { name });
                await dispatch("group/getAllGroup", null, { root: true });
                await dispatch("getAllDevices");
                return response;
            }
            catch (error) {
                if (error.response) {
                    console.error("Response error:", error.response.status, error.response.data);
                } else {
                    console.error("Network error:", error.message);
                }

                throw Error(error.message);
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
                throw Error(error.message);
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
                throw Error(error.message);
            }
        },
        async getAllDevicesForTemperature({commit},type){
            try {
                const response = await api.get(`/api/devicesWithTermostat?type=${type}`);
                commit('setDeviceForTemperature',response.data.data);
                return response;
            }
            catch(error){
                throw Error(error.message);
            }
        },
        async setDataOfDeviceForTemperature({commit},payload){
            try {
                const response = await api.post(`/api/setDataOfDeviceForTemperature/${payload.id}`,payload.data);
                commit('setDeviceForTemperature',response.data.data);
                return response;
            }
            catch(error){
                throw Error(error.message);
            }
        }
    },
};