<template>
  <!-- <div>

    
  </div> -->
  <div v-if="dataLocal.temperature" :data-id="data.id" class="lamp background-block">
    <h2>{{ dataLocal.name }}</h2>

    <div class="center">
      <Knob readonly v-model="changedTemperature" :min="0" :max="30" :step="1" :size="200" valueColor="#4caf50"
        rangeColor="#e0e0e0" />
      <div class="flex gap-2">
        <Button icon="pi pi-plus" @click="changedTemperature++" :disabled="changedTemperature >= 30" />
        <Button icon="pi pi-minus" @click="changedTemperature--" :disabled="changedTemperature <= 18" />
      </div>
    </div>
    <p>Trenutna temperatura: {{ dataLocal.temperature }}°C</p>
    <p class="text">Trenutni status: <span class="color-green">UKLJUČENO</span></p>
    <h3>Promeni status</h3>
    <ToggleButton v-model="checked" size="large" onLabel="Ukljuceno" offLabel="Iskljuceno" />
    <Button>Sacuvaj</Button>

    <!-- <div v-if="data.temperature">
      <TemperatureChart :temperature="data.temperature" />
      <button @click="seeDetails()">Pogledaj detalje</button>
    </div>
    <div v-else>
      <p>
        Trenutno nema ucitanih uredjaja za tu sobu.
      </p>
      <button @click="addDeviceForHeating()">Dodaj uredjaj za grejanje</button>
      <button @click="addDeviceForHeating()">Dodaj uredjaj za merenje temperature</button>
    </div> -->
  </div>
  <div class="lamp background-block" v-else>
    <h3>Trenutno nema dodate temperature za uredjaj <strong>{{ data.name }}</strong></h3>
    <ButtonMy @click="showModalMy()">Dodajte termostat</ButtonMy>
  </div>
  <Teleport to="body">
    <modal-layout :modal-content="modalContent" v-if="isOpen" :visible="isOpen" @close="ugasi()"
      @getDatas="setToStepRecivedData" @finish="sendAllData">
      <template #body>
        <SelectingFormView :textOnButtons="textOnButton" :showModals="showModals" v-if="activeForms === ''"
          @changeForms="setNewForms" />
        <TempDeviceForm :idDevice="dataLocal.id" v-if="activeForms === 'newTermo'" />
        <!-- <DeviceFormCheckBox v-if="activeForms === 'existingTermo'" /> -->

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
import { defineProps, ref, watch } from 'vue';
import SelectingFormView from '@/features/others/selectingFormView.vue';
// import TemperatureChart from '../ui/TemperatureChart.vue';
import TempDeviceForm from '@/features/devices/TempDeviceForm.vue';
// import DetailsForTemperature from './DetailsForTemperature.vue';
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});
const activeForms = ref('');
const textOnButton = ref(['Dodaj novi termostat','Dodaj vec postojeci termostat']);
const showModals = ref(['newTermo','existingTermo']);
const setNewForms = (selectedForms) => activeForms.value = selectedForms;
const checked = ref(false);
const changedTemperature = ref(props.data.temperature);
const dataLocal = ref(props.data);
const { isOpen, show, close, modalContent } = showModal();

const showModalMy = () => {
  show("Izaberite opciju:");
}
// const steps = shallowRef([{ component: TempDeviceForm, props: { previousValue: {},idDevice : props.data.id } }
//   , {component: TempDeviceForm,props: { previousValue: {},idDevice : props.data.id }}]);

// const setToStepRecivedData = (data) => {
//   steps.value[data.step - 1].props.previousValue = data;
// }

// const resetAllInputs = ()=>{
//   steps.value.forEach((x)=>{
//     x.props.previousValue = {};
//   })
// }
// const sendAllData = () =>{
//   console.log(steps.value);
// }
const ugasi = () => {
  // resetAllInputs();
  close();
}


watch(() => props.data, (newValue) => {
  dataLocal.value = newValue;
  changedTemperature.value = newValue.temperature;
})

// const seeDetali = ref(false);

// function seeDetails() {
//   show();
//   seeDetali.value = true;
// }

// function addDeviceForHeating() {
//   show();
//   seeDetali.value = false;
// }

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