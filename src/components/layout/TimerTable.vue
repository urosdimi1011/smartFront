<template>
    <template v-if="timers && timers.length > 0">
        <DataTable v-model:editingRows="editingRows" size="large" editMode="row" dataKey="id"
            @row-edit-save="onRowEditSave" :value="timers" scrollHeight="400px">
            <Column class="width-column-input" field="name" header="Ime">
                <template #editor="{ data, field }">
                    <InputText class="width-column-input" v-model="data[field]" fluid />
                </template>
            </Column>
            <Column field="status" header="Akcija">
                <template #body="{ data }">
                    <Tag :value="data.status ? 'uključi' : 'isključi'" :severity="data.status ? 'success' : 'danger'" />
                </template>
                <template #editor="{ data, field }">
                    <ToggleButton :modelValue="Boolean(data[field])"
                        @update:modelValue="val => data[field] = val ? 1 : 0" size="large" onLabel="Ukljuci"
                        offLabel="Iskljuci" />
                    <!-- <ToggleSwitch :modelValue="Boolean(data[field])" @update:modelValue="val => data[field] = val ? 1 : 0" /> -->
                </template>
            </Column>
            <Column field="devices" header="Uredjaji">
                <template #body="{ data }">
                    {{ formatDevices(data.devices) }}
                </template>
                <template #editor="{ data, field }">
                    <FormInput type="groupCheckBox"
                        :modelValue="Array.isArray(data[field]) ? data[field].map(d => d.id) : []" @update:modelValue="newIds => {
                            const updatedDevices = newIds.map(id => {
                                const foundDevice = devicesDisplay.find(d => d.value === id);
                                return foundDevice ? { id: foundDevice.value, name: foundDevice.label } : { id, name: 'Nepoznato' };
                            });

                            if (JSON.stringify(updatedDevices) !== JSON.stringify(data[field])) {
                                data[field] = updatedDevices;
                            }
                        }" :options="devicesDisplay" multiSelect label="Izaberite uredjaje" name="idsDevice" />

                </template>
            </Column>
            <Column field="days" header="Dani">
                <template #body="{ data }">
                    {{ formatDevices(data.days) }}
                </template>
                <template #editor="{ data, field }">
                    <FormInput type="groupCheckBox"
                        :modelValue="Array.isArray(data[field]) ? data[field].map(d => d.id) : []" @update:modelValue="newIds => {
                            const updatedDevices = newIds.map(id => {
                                const foundDevice = devicesDisplay.find(d => d.value === id);
                                return foundDevice ? { id: foundDevice.value, name: foundDevice.label } : { id, name: 'Nepoznato' };
                            });

                            if (JSON.stringify(updatedDevices) !== JSON.stringify(data[field])) {
                                data[field] = updatedDevices;
                            }
                        }" id="days" :options="days" multiSelect label="Izaberite dane" name="idsDays" />
                </template>
            </Column>
            <Column class="width-column-input" field="time" header="Vreme">
                <template #editor="{ data, field }">
                  {{data[field]}}
                    <DatePicker name="time" class="width-column-input p-datepicker-time-picker-moj" v-model="data[field]" timeOnly :utcOffset="0"/>
                </template>
            </Column>
            <Column field="active" header="Aktivan">
                <template #body="{ data }">
                    <ToggleSwitch disabled :modelValue="Boolean(data.active)"
                        @update:modelValue="val => data.active = val ? 1 : 0" />
                </template>
                <template #editor="{ data, field }">
                    <ToggleSwitch :modelValue="Boolean(data[field])"
                        @update:modelValue="val => data[field] = val ? 1 : 0" />
                </template>
            </Column>
            <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
            <Column field="id" header="Brisanje">
                <template #body="{ data, field }">
                    <button @click="removeTimer(data[field])">
                        <PhTrash :size="32" />
                    </button>
                </template>
            </Column>
        </DataTable>
    </template>
    <div v-if="timers && timers.length == 0">
        <p>Trenutno nema setovanih tajmera</p>
    </div>
    <div class="spinner-container" v-if="timers == null">
        <ProgressSpinner />
    </div>
    <modal-layout :modal-content="modalContent" :visible="isOpen" @close="close()" :confirm="confirm">

    </modal-layout>
</template>

<script setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from "primevue/tag";
import ToggleSwitch from "primevue/toggleswitch";
import ToggleButton from "primevue/togglebutton";
import ProgressSpinner from 'primevue/progressspinner';
import InputText from 'primevue/inputtext';
import modalLayout from '@/components/modalLayout.vue';
import DatePicker from 'primevue/datepicker';
import { onMounted, ref, computed,defineEmits } from 'vue';
import store from '@/store';
import { useToast } from 'vue-toastification';
import FormInput from '@/components/ui/FormInput.vue';
import { PhTrash } from "@phosphor-icons/vue";
import { showModal } from '@/composables/modal';

// import timer from '@/store/modules/timer';

const toast = useToast();
const emit = defineEmits('close');
const idTimer = ref(0);
const timers = computed(() => {
    return store.getters['timer/getListOfTimer'];
});
const { isOpen, show, close,modalContent,confirm } = showModal();

const days = [
    { label: "Ponedeljak", value: 1 },
    { label: "Utorak", value: 2 },
    { label: "Sreda", value: 3 },
    { label: "Četvrtak", value: 4 },
    { label: "Petak", value: 5 },
    { label: "Subota", value: 6 },
    { label: "Nedelja", value: 7 },
];


const formatDevices = (devices) => {
    if (devices.length)
        return devices.map(device => device.name).join(", ");
    return 'Nema uredjaja';
};
// const updateDays = (data, newIds) => {
//     data.days = days.filter(day => newIds.includes(day.id));
// };
const getAllTimers = async () => {
    try {
        await store.dispatch('timer/getAll');
        // timers.value = response.data.timers;
    }
    catch (error) {
        toast.error(error.message);
    }
}
const getAllDevices = () => {
    return store.getters['device/getAllDevices'];
}

const devicesDisplay = computed(() => {
    const devices = getAllDevices();
    if (devices && devices.length) {
        return devices.map((x) => {
            return {
                label: x.name,
                value: x.id
            }
        })

    }
    return [];
})

const removeTimer = (id) => {
    idTimer.value = id;
    show(`Da li ste sigurni da zelite da obrisete tajmer?`, removeTimerRealy);
}
const removeTimerRealy = async () => {
  console.log(":USlii");
    try {
        const response = await store.dispatch('timer/deleteTimer',{id : idTimer.value});
        toast.success(response.data.message, {
            timeout: 3000
        });
        emit('close');
    }
    catch(error){
        toast.error(error.message, {
            timeout: 3000
        });
    }
}

onMounted(() => {
    getAllTimers();
})

// Podaci za editovanje 

const editingRows = ref([]);

const onRowEditSave = async (event) => {
    let { newData } = event;
    console.log(newData.time);
    const dataForSend = {
        "name": newData.name,
        "time": newData.time,
        "status": newData.status,
        "active": newData.active,
        "id": newData.id,
        "idsDevice": newData.devices.map(x => x.id),
        "idsDays": newData.days.map(x => x.id)
    }

    try {
        await store.dispatch("timer/changeTimer", dataForSend);
        toast.success("Uspesno ste izmenili tajmer", {
            timeout: 3000
        });
    }
    catch (error) {
        toast.error(error.message, {
            timeout: 3000
        })
    }
}
</script>

<style>
button {
    background-color: transparent;
    border: none;
}
.width-column-input{
  width: 200px !important;
}
table button {
    cursor: pointer;
}
</style>