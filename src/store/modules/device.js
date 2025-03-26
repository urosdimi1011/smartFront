import api from "@/config/axios";
// Uradi funckionalnost promene statusa uredjaja iz 0 u 1 i obrnuto!
export default {
    namespaced: true,
    state: () => ({
        device: null
    }),
    getters: {
        getAllDevices(state) {
            return state.device;
        }
    },
    mutations: {
        setDevice(state, payload) {
            state.device = payload;

        }
    },
    actions: {
        async addDevice(_commit, payload) {
            const response = await api.post('/api/device', payload);
            // commit('setUser',response.data.user);
            // commit('setJwtToken',response.data.token);
            return response;
        },
        async getAllDevices({ commit }) {
            try {
                const response = await api.get('/api/device');
                commit('setDevice', response.data.devices);
                return response.data.devices;
            }
            catch (error) {
                throw Error(error.message);
            }
        },
        async changeStatusOfDevice({ dispatch }, { id, status }) {
            try {
                const response = await api.get(`/api/device/status/${id}?status=${Number(status)}`);
                // Da li ovo moze drugacije da se resi????
                await dispatch("group/getAllGroup", null, { root: true });
                await dispatch("getAllDevices");
                return response;
            }
            catch (error) {
                throw Error(error.message);

            }

        },
        async changeStautsOfDeviceInGroup({ dispatch }, { id, status }) {
            try {
                const response = await api.patch(`/api/device/group/${id}`, { status });
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
        }
    },
};