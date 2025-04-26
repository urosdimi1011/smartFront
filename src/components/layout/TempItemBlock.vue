<template>
  <div v-if="dataLocal.termostat" :data-id="data.id" class="lamp background-block">
    <h2>{{ dataLocal.name }}</h2>
    <div class="center">
      <Knob readonly v-model="changedTemperature" :min="0" :max="30" :step="1" :size="200" valueColor="#4caf50"
        rangeColor="#e0e0e0" />
      <div class="flex gap-2">
        <Button icon="pi pi-plus" @click="changedTemperature++" :disabled="changedTemperature >= 30" />
        <Button icon="pi pi-minus" @click="changedTemperature--" :disabled="changedTemperature <= 18" />
      </div>
    </div>
    <template v-if="temperatureInfo.last_reading_of_termostat">
      <p>Trenutna temperatura: {{ temperatureInfo.last_reading_of_termostat }}°C</p>
    </template>
    <template v-else>
      <p>Tretnurno nema očitane temperature</p>
    </template>
    <p class="text">Trenutni status:
      <template v-if="dataLocal.status">
        <span class="color-green">UKLJUČENO</span>
      </template>
      <template v-else>
        <span class="color-red">ISKLJUČENO</span>
      </template>
    </p>
    <div class="maintain-block">
      <FormInput
          v-model="maintainTermostat"
          id="maintain_temperature"
          name="maintain_temperature"
          type="checkbox"
          class="d-flex"
          label="Održavaj temperaturu"
      />
    </div>
    <h3>Promeni status</h3>
    <ToggleButton v-model="checked" size="large" onLabel="Ukljuceno" offLabel="Iskljuceno" />
    <Button @click="submit()">Sacuvaj</Button>
  </div>
  <div class="lamp background-block" v-else>
    <h3>Trenutno nema dodati termostat za uredjaj <strong>{{ data.name }}</strong></h3>
    <ButtonMy @click="showModalMy()">Dodajte termostat</ButtonMy>
  </div>
  <Teleport to="body">
    <modal-layout :title="titleOfForm" :modal-content="modalContent" v-if="isOpen" :visible="isOpen" @close="ugasi()"
      @getDatas="setToStepRecivedData" @finish="sendAllData">
      <template #body>
        <SelectingFormView :textOnButtons="textOnButton" :showModals="showModals" v-if="activeForms === ''"
          @changeForms="setNewForms" />
        <TempDeviceForm :idDevice="dataLocal.id" v-if="activeForms === 'newTermo'" @close="ugasi()"/>
        <TermostatFormCheck :idDevice="dataLocal.id" v-if="activeForms === 'existingTermo'" @close="ugasi()"/>

      </template>
    </modal-layout>
  </Teleport>
</template>
<script setup>
import Knob from 'primevue/knob';
import Button from 'primevue/button';
import ToggleButton from 'primevue/togglebutton';
import modalLayout from '../modalLayout.vue';
import { showModal } from '../../composables/modal'; // Uvođenje composable-a
import {computed, defineProps, onUnmounted, ref, watch, onUpdated, inject} from 'vue';
import {useStore} from 'vuex';
import SelectingFormView from '@/features/others/selectingFormView.vue';
import TempDeviceForm from '@/features/devices/TempDeviceForm.vue';
import TermostatFormCheck from "@/features/termostat/TermostatFormCheck.vue";
import FormInput from "@/components/ui/FormInput.vue";
import { useToast } from 'vue-toastification';

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});
const activeForms = ref('');
const textOnButton = ref(['Dodaj novi termostat','Dodaj vec postojeci termostat']);
const showModals = ref(['newTermo','existingTermo']);
const titleOfForm = ref('');
const store = useStore();
const toast = useToast();

const temperatureInfo = computed(()=>{
  return dataLocal.value.termostat;
})
const setNewForms = (selectedForms) => {
  if(selectedForms === 'newTermo'){
    titleOfForm.value = "Dodajte novi termostat";
  }
  else if(selectedForms === 'existingTermo'){
    titleOfForm.value = 'Izaberite termostat';
  }
  activeForms.value = selectedForms
};
const dataLocal = ref(props.data);
const checked = ref(dataLocal.value.status);
const maintainTermostat = ref(
    !!dataLocal.value?.termostat?.maintain_temperature
);
const selectedType = inject('selectedType');

const changedTemperature = ref(
    dataLocal.value?.termostat?.desired_temperature ??
    dataLocal.value?.termostat?.last_reading_of_termostat ?? 0
);
const { isOpen, show, close, modalContent } = showModal();

const showModalMy = () => {
  show("Izaberite opciju:");
}
const ugasi = () => {
  activeForms.value = "";
  titleOfForm.value = "";
  // resetAllInputs();
  close();
}
onUnmounted(()=>{
  activeForms.value = "";
})

onUpdated(()=>{
  console.log("Uslii");
})

watch(() => props.data, (newValue) => {
  dataLocal.value = newValue;
  changedTemperature.value = newValue?.termostat?.desired_temperature ?? newValue?.termostat?.last_reading_of_termostat ?? 0
  maintainTermostat.value = Boolean(newValue?.termostat?.maintain_temperature);
})
const submit = async ()=>{
//   Znaci treba da posaljem id tog uredjaja i da li da se uredjaj upali ili ugasi i setovanu temperaturu
  //znaci podaci su sledeci
  //idUredjaja
  //status
  //odabranaTemperatura
  try{
    const dataForSend=  {
      "status":checked.value,
      "desired_temperature" : changedTemperature.value,
      "termostat_id":dataLocal.value.termostat.id,
      'maintain_temperature': maintainTermostat.value ? 1 : 0
    }

    const response = await store.dispatch('device/setDataOfDeviceForTemperature',{data : dataForSend,id : dataLocal.value.id,});
    await store.dispatch('device/getAllDevicesForTemperature',selectedType.value);

    toast.success(response.data.message,{timeout:3000});
  }
  catch (error){
    toast.error(error.message,{timeout:3000});
  }


}
</script>
<style scoped>
.center {
  text-align: center
}

.p-button {
  border: 1px solid black;
  padding: 10px;
  margin: 10px;
  border-radius: 10px;
}

.p-button:not(:disabled):hover {
  border: 1px solid black;
}

.width-50 {
  width: 50%;
}

.text {
  font-size: 20px;
  margin: 20px 0px;
}

.text span {
  font-weight: bold;
}
.d-flex{
  display: flex;
  justify-content: center;
  gap:20px;
}
.groups-items {
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  /* margin-top: 20px; */
}

.groups-items button {
  margin: 10px 0px;
}

.groups-items input {
  height: 100%;
  display: inline-block;
}

.groups-items input::placeholder {
  color: black;
}

.color-green {
  color: rgba(0, 255, 0, 0.9);
}
.color-red{
  color : #7f0000;
}

h3 {
  margin: 10px 0px;
}

.flex {
  display: flex;
}



button {
  width: 60%;
  margin-top: 20px;
}

.background-block {
  backdrop-filter: none;
}

h3 {
  font-weight: 200;
}
</style>