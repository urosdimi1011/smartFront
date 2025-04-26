<template>
    <Form @submit="submit" :initial-values="formValues" :validation-schema="schema">
        <template v-if="deviceOptions && deviceOptions.length > 0">
            <FormInput v-model="devices" label="Izaberite uredjaje" type="checkbox" :options="deviceOptions"
                id="devices" name="devices" />
            <template v-if="stepForm">
                <ButtonMy>Dodaj</ButtonMy>
            </template>
        </template>
      <template v-if="deviceOptions && deviceOptions.length === 0">
        <p>Trenutno nema dodatih uredjaja</p>
      </template>
        <template v-if="!deviceOptions">
          <ProgressSpinner/>
        </template>
    </Form>
</template>
<script setup>
import * as yup from 'yup';
import { Form, useForm, useField } from 'vee-validate';
import { ref, onMounted, defineProps, defineEmits, watch, defineExpose, computed,reactive,inject } from 'vue';
import FormInput from '@/components/ui/FormInput.vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import ProgressSpinner from 'primevue/progressspinner';


const idCategory = inject('idCategory');

//Ovo smo stavili iz razloga zato sto props ne moze da se menja, a nama je props previousValue, koji sadrzi sve podatke!!!!
// const devicesChecked = ref([]);

const props = defineProps({
    previousValue: {
        type: Object,
        required: false,
        default: () => ({})
    },
    stepForm: {
        type: Boolean,
        required: false,
        default: false
    },
    idGrupe: {
        type: Number,
        required: false
    }
});
const store = useStore();
const toast = useToast();
const groups = computed(() => {
    // console.log(store.getters['group/getAllDevicesOfGroup'](props.idGrupe))
    return store.getters['group/getAllDevicesOfGroup'](props.idGrupe);
})
const schema = yup.object().shape({
  devices: yup.array()
      .test(
          "at-least-one-checked",
          "Morate odabrati bar jedan uređaj",
          (devicesLocal) => {
            if (deviceOptions.value && deviceOptions.value.length === 0 && devicesLocal && devicesLocal.length === 0) return true;
            return devicesLocal && Array.isArray(devicesLocal) && devicesLocal.length > 0;
          }
      )
});
// OVO JE NOVO I OBRATI PAZNJU NA OVO STO JE DODATO!!
const { validate } = useForm({
    validationSchema: schema,
    initialValues: { devices: [] },
});
const { value: devices } = useField('devices');

const deviceOptions = ref(null);

defineExpose({ validate});

function isValidSync(data) {
    try {
        schema.validateSync(data); // Ako nije validno, baca grešku
        return true; // Ako validacija uspe
    } catch (error) {
        return false; // Ako validacija ne uspe
    }
}
//OVDE IMA PROBLEMMM!!!
const formValues = reactive({
    devices: props.previousValue.devices || (groups.value ? groups : []),
});

const emit = defineEmits(['onSubmit','close']);


watch(devices, (newVal) => {
    if (!props.stepForm) {
        sendDataToModal(newVal);
    }
    // emit('onSubmit',{"devices":newVal,step:2,validate:isValidSync(newVal)});
});

async function getAllDevices() {
    try {
      if(idCategory){
        const response = await store.dispatch("device/getAllDevices",parseInt(idCategory));
        setDeviceOptions(response);
      }
      else{
        const response = await store.dispatch("device/getAllDevices");
        setDeviceOptions(response)
      }
    }
    catch (error) {
      toast.error(error,{timeout:3000});
    }
}


const sendDataToModal = (newVal) => {
    emit('onSubmit', { "devices": newVal, step: 2, validate: isValidSync({ devices: newVal }) });
}

onMounted(async () => {
    await getAllDevices();
    // Postavljanje inicijalnih vrednosti za čekirane uređaje
    if (props.previousValue.devices) {
      setDefaultValueForDeviceWhenComponentIsLoaded(props.previousValue.devices);
    }
    else{
        if(props.stepForm){
          setDefaultValueForDeviceWhenComponentIsLoaded(groups.value);
        }
    }
});

const setDefaultValueForDeviceWhenComponentIsLoaded = (data)=>{
  devices.value = data;
}

const setDeviceOptions = (data)=>{
  deviceOptions.value = data;
}

async function submit(values) {
    if (props.stepForm) {
        try {
            const response = await store.dispatch('group/AddDevicesInGroup', { id: props.idGrupe, ...values });
             toast.success(response.message, {
                timeout: 3000
            });
        }
        catch (error) {
            toast.error(error.message, {
                timeout: 3000
            });
        }
        emit('close');
    }
    else {
        emit('onSubmit', { values, step: 2 });
    }
}

</script>
<style scoped>
span {
    display: block;
    margin: 10px 0;
    color: rgba(255, 0, 0, 0.9);
}

.form-group {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
}

.form-group input {
    padding: 10px;

}

.form-button {
    color: black;
    border: 1px solid black;
    padding: 5px 10px;
}

.form-group label {
    display: block;
    font-size: 20px;
    margin-bottom: 10px;
}

.form-group {
    margin: 20px 0px;
}
</style>