<template>
    <div class="page">
        <div class="add-timer-content">
            <Form @submit="submit" :validation-schema="schema">
                <div class="groups-items">
                    <p>Nazovi tajmer</p>
                    <FormInput id="name" name="name" class="moj-tajmer-input"/>
                </div>
                <div class="groups-items">
                    <p>Dodaj vreme</p>
                    <DatePicker name="date" class="p-datepicker-time-picker-moj" v-model="templatedisplay" timeOnly />
                </div>
                <div class="groups-items">
                    <p>Uredjaj treba da se:</p>
                  <ToggleSwitch
                      v-model="turn" name="turn">
                    <template #handle="{ checked }">

                      <i :class="['!text-xs pi', { 'pi-check': checked, 'pi-times': !checked }]" />
                    </template>
                  </ToggleSwitch>
<!--                    <ToggleButton name="turn" v-model="turn" size="large" onLabel="Ukljuci" offLabel="Iskljuci" />-->
                </div>
                    <FormInput class="flex" type="groupCheckBox" v-model="selectedDays" id="days" :options="days" multiSelect
                        label="Izaberite dane" name="days" />

                    <FormInput class="flex" type="groupCheckBox" v-model="devicesSelected" id="devices" :options="devicesDisplay"
                        multiSelect label="Izaberite uredjaje" name="devices" />
                    <ButtonMy class="form-button">Dodaj tajmer </ButtonMy>
            </Form>
        </div>
    </div>
</template>
<script setup>
import * as yup from 'yup';
import FormInput from '@/components/ui/FormInput.vue';
import DatePicker from 'primevue/datepicker';
import ToggleSwitch from 'primevue/toggleswitch';
import { computed, onMounted, ref,defineEmits } from 'vue';
import { Form } from 'vee-validate';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
const days = [
    { label: "Ponedeljak", value: 1 },
    { label: "Utorak", value: 2 },
    { label: "Sreda", value: 3 },
    { label: "Četvrtak", value: 4 },
    { label: "Petak", value: 5 },
    { label: "Subota", value: 6 },
    { label: "Nedelja", value: 7 },
];
// const devices = ref([]);

const schema = yup.object({
    name: yup.string().required("Morate uneti ime")
})

const store = useStore();

// const { isOpen, show, close } = showModal();

const emit = defineEmits(['close']);
const toast = useToast();

const selectedDays = ref([]);
const devicesSelected = ref([]);
const templatedisplay = ref('');
const turn = ref(false);
const devicesDisplay = computed(() => {
    if (devicesAll.value && devicesAll.value.length) {
        return devicesAll.value.map((x) => {
            return {
                label: x.name,
                value: x.id
            }
        })

    }
    return [];
})
const getAllDevices = async () => {
     await store.dispatch("device/getAllDevices");
    // devices.value = d.data.devices;
}

const devicesAll = computed(()=>{
    return store.getters["device/getAllDevices"];
})

onMounted(() => {
    getAllDevices();
})
const submit = async (values) => {
    const dataToSend = {
        "name": values.name,
        "time": templatedisplay.value.toISOString(),
        "status": turn.value,
        "idsDevice": devicesSelected.value,
        "idsDays": selectedDays.value
    }
    try{
        // console.log(dataToSend);
        await store.dispatch("timer/setTimer",dataToSend);
        toast.success("Uspesno ste dodali tajmer",{timeout:3000});
        emit('close');
    }
    catch(error){
        toast.error(error.message,{timeout:3000});
    }


}

</script>
<style scoped>

.p-datepicker-panel {
    background-color: #fff !important;
}
.groups-items{
  //align-items: stretch !important;
  min-height: 8vh;
}
.groups-items p{
    width: 70%;
    font-size:20px;
}
.day-checkbox {
    margin-bottom: 10px;
}
label {
    margin-left: 5px;
}
button {
    margin-top: 20px !important;
}
.w-50{
  width:50%;
}
.flex{
  display:flex;
  align-items:center;
  justify-content: space-between;
}
</style>