<template>
  <Form @submit="submit" :validation-schema="schema">
    <template v-if="termostats && termostats.length > 0">
      <FormInput v-model="selectedTermosta" type="radio" :options="termostats"
                 id="selectedTermosta" name="selectedTermosta" />
        <ButtonMy>Dodaj</ButtonMy>
    </template>
    <template v-if="termostats && termostats.length === 0">
      <p>Trenutno nema dodatih termostata</p>
    </template>
    <template v-if="!termostats">
      <ProgressSpinner/>
    </template>
  </Form>
</template>
<script setup>
import { Form } from 'vee-validate';
import {ref, onMounted, defineProps, defineEmits, inject} from 'vue';
import FormInput from '@/components/ui/FormInput.vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import ProgressSpinner from 'primevue/progressspinner';
import * as yup from "yup";
const termostats = ref(null);
const schema = yup.object().shape({
  selectedTermosta: yup.string().required('Morate izabrati jedan termostat')
});

const props = defineProps({
  idDevice : {
    type: Number,
    required : true
  }
})
const selectedType = inject('selectedType');
const emit = defineEmits(['close']);

//Ovo smo stavili iz razloga zato sto props ne moze da se menja, a nama je props previousValue, koji sadrzi sve podatke!!!!
// const devicesChecked = ref([]);
const toast = useToast();
/*const props = defineProps({
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
});*/
const store = useStore();
const selectedTermosta = ref(null);
// const toast = useToast();


// const emit = defineEmits(['onSubmit','close']);

async function getAllTermostat() {
  try {
    const response = await store.dispatch("termostat/getAll");
    console.log(response);
    setDeviceOptions(response);
  } catch (error) {
    toast.error(error.message,{timeout:3000});
  }
}
const setDeviceOptions = (data)=>{
  termostats.value = data;
}
onMounted(async () => {
  await getAllTermostat();
  // Postavljanje inicijalnih vrednosti za čekirane uređaje
})
const submit = async (values)=>{
  try {
    await store.dispatch('termostat/addTermostatToDevice',{id: props.idDevice,idTermostat : values.selectedTermosta});
    toast.success("Uspesno ste povezali termostat sa uredjajem",{timeout:3000});
    await store.dispatch('device/getAllDevicesForTemperature',selectedType.value);
    emit('close');
  }
  catch (error){
    toast.error(error.message,{timeout:3000});
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