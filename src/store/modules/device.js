import api from "@/config/axios";
export default {
  namespaced: true,
  state: () => ({
    device: null,
    deviceForTemperature: null,
    selectedType: null,
    isLoading: false,
  }),
  getters: {
    getAllDevices(state) {
      return state.device;
    },
    isLoading(state) {
      return state.isLoading;
    },
    getDeviceOfTemperatureForSelectedType(state) {
      console.log(state.deviceForTemperature);
      if (state.deviceForTemperature) {
        return [...state.deviceForTemperature];
      } else {
        return state.deviceForTemperature;
      }
    },
    getSelectedType(state) {
      return state.selectedType;
    },
  },
  mutations: {
    setLoading(state, payload) {
      state.isLoading = payload;
    },
    setDevice(state, payload) {
      state.device = payload;
    },
    setDeviceForTemperature(state, payload) {
      state.deviceForTemperature = payload;
    },
    setSelectedType(state, payload) {
      state.selectedType = payload;
    },
    updateDevice(state, updatedDevice) {
      const index = state.device.findIndex((d) => d.id === updatedDevice.id);
      if (index !== -1) {
        state.device.splice(index, 1, updatedDevice);
      }
    },
    updateDevices(state, updatedDevices) {
      if (Array.isArray(updatedDevices)) {
        updatedDevices.forEach((updated) => {
          const index = state.device.findIndex((d) => d.id === updated.id);
          if (index !== -1) {
            state.device[index] = { ...state.device[index], ...updated };
          }
        });
      } else {
        const index = state.device.findIndex((d) => d.id === updatedDevices.id);
        state.device[index] = { ...state.device[index], ...updatedDevices };
      }
    },
    removeDevices(state, idsForRemove) {
      idsForRemove.forEach((remove) => {
        state.device.forEach((x, y) => {
          if (x.id == remove) {
            state.device.splice(y, 1);
          }
        });
      });
    },
    addDevice(state, newDevice) {
      state.device.push(newDevice);
    },
    resetState(state) {
      state.device = [];
    },
  },
  actions: {
    async addDevice({ dispatch, commit }, payload) {
      const response = await api.post("/api/device", payload);

      commit("addDevice", response.data.device);
      dispatch("group/assignDevicesToGroups", null, { root: true });
      // dispatch("group/getAllGroup", null, { root: true });
      return response;
    },
    async getAllDevices(
      { commit },
       payload = {}
    ) {
        const { typeId = null, showGlobalLoading = true } = payload;
      try {
        if (showGlobalLoading) {
          commit("setLoading", true);
        }
        let response = null;
        if (typeId !== null) {
          response = await api.get(`/api/device?typeId=${typeId}`);
        } else {
          response = await api.get("/api/device");
        }
        console.log(response);
        commit("setDevice", response.data.devices);
        if (showGlobalLoading) {
          commit("setLoading", false);
        }
        return response.data.devices;
      } catch (error) {
        if (showGlobalLoading) {
            commit('setLoading', false);
        }
        throw Error(error);
      }
    },
    async changeStatusOfDevice({ dispatch, commit }, { id, status, pin }) {
      try {
        const response = await api.get(
          `/api/device/status/${id}?status=${Number(status)}&pin=${pin}`
        );
        commit("updateDevice", response.data);
        dispatch("group/assignDevicesToGroups", null, { root: true });
        return response;
      } catch (error) {
        throw Error(error);
      }
    },
    async changeStatusOfDeviceWithSocket({ dispatch, commit }, device) {
      try {
        commit("updateDevice", device);
        dispatch("group/assignDevicesToGroups", null, { root: true });
      } catch (error) {
        throw Error(error);
      }
    },
    async changeStautsOfDeviceInGroup(
      { dispatch, commit },
      { id, status, ids }
    ) {
      try {
        const response = await api.patch(`/api/device/group/${id}`, {
          status,
          ids,
        });
        const updatedDevices = response.data.devices;
        commit("updateDevices", updatedDevices);
        dispatch("group/assignDevicesToGroups", null, { root: true });
        return response;
      } catch (error) {
        if (error.response) {
          console.error(
            "Response error:",
            error.response.status,
            error.response.data
          );
        } else {
          console.error("Network error:", error.message);
        }

        throw Error(error);
      }
    },
    async changeNameOfDevice({ dispatch, commit }, { id, name }) {
      const response = await api.patch(`/api/device/name/${id}`, { name });
      const updatedDevices = response.data.device;
      commit("updateDevices", updatedDevices);
      await dispatch("group/assignDevicesToGroups", null, { root: true });
      return response;
    },
    async deleteDevice({ dispatch, commit }, { id }) {
      try {
        const response = await api.delete(`/api/device/${id}`);
        const updatedDevices = response.data.device;
        commit("updateDevices", updatedDevices);
        await dispatch("group/getAllGroup", null, { root: true });
        return response;
      } catch (error) {
        throw Error(error);
      }
    },
    async deleteDevices({ dispatch, commit }, { ids }) {
      try {
        const response = await api.delete(`/api/device`, {
          params: {
            ids,
          },
        });
        const removeDevices = response.data.devices;
        commit("removeDevices", removeDevices);
        dispatch("group/assignDevicesToGroups", null, { root: true });
        // await dispatch("group/getAllGroup", null, { root: true });
      } catch (error) {
        const enhancedError = new Error(
          error.response?.data?.message ||
            error.message ||
            "Greška prilikom brisanja uređaja"
        );
        enhancedError.originalError = error;
        enhancedError.statusCode = error.response?.status;

        throw enhancedError;
      }
    },
    async changeBrightnessForDevice({ dispatch }, { id, brightness }) {
      try {
        const response = await api.patch(`/api/device/${id}`, { brightness });
        await dispatch("group/getAllGroup", null, { root: true });
        await dispatch("getAllDevices");
        return response;
      } catch (error) {
        throw Error(error);
      }
    },
    async getAllDevicesForTemperature({ commit, state }, type = null) {
      try {
        if (type != null) {
          state.selectedType = type;
        }
        const response = await api.get(
          `/api/devicesWithTermostat?type=${state.selectedType}`
        );
        commit("setDeviceForTemperature", response.data.data);
        return response;
      } catch (error) {
        throw Error(error);
      }
    },
    async setDataOfDeviceForTemperature({ dispatch }, payload) {
      try {
        const response = await api.post(
          `/api/setDataOfDeviceForTemperature/${payload.id}`,
          payload.data
        );
        await dispatch("getAllDevicesForTemperature");
        return response;
      } catch (error) {
        throw Error(error);
      }
    },
  },
};
