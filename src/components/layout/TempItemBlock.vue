<template>
  <div>
    <div v-if="dataLocalForComputed && dataLocalForComputed.termostat" :data-id="data.id" class="temp-card">
      <energy-consumption :today-stats="data.today_stats" :month-stats="data.month_stats"
        :energy-stats="data.energy_stats" :has-consumption="!!data.energy_stats" class="custom-icon-color-for-energy" />
      <div class="option-header-block">
        <span>Termostat za uredjaj: <strong>{{ dataLocal.termostat.name }}</strong></span>
        <span @click="openSettings()">
          <PhGear :size="32" />
        </span>
      </div>
      <div class="temp-header">
        <h2 class="device-name">{{ dataLocal.name }}</h2>
        <div class="status-badge" :class="{ 'active': dataLocal.status }">
          {{ dataLocal.status ? 'UKLJUČENO' : 'ISKLJUČENO' }}
        </div>
      </div>

      <div class="temp-controls">
        <div class="knob-section">
          <div class="knob-container">
            <Knob v-model="changedTemperature" :disabled="isDisabled" :min="0" :max="30" invalid="" :step="1"
              :size="180" valueColor="#4caf50" rangeColor="#e0e0e0" class="temp-knob" />
            <div class="temp-display">
              <span class="temp-value">{{ changedTemperature }}°C</span>
              <span class="temp-label">Željena</span>
            </div>
          </div>

          <div class="temp-buttons">
            <Button icon="pi pi-minus" @click="changedTemperature--" :disabled="changedTemperature <= 18"
              class="temp-btn decrease" size="small" outlined />
            <Button icon="pi pi-plus" @click="changedTemperature++" :disabled="changedTemperature >= 30"
              class="temp-btn increase" size="small" outlined />
          </div>
        </div>

        <div class="info-panel">
          <div class="current-temp">
            <div class="temp-reading">
              <template v-if="temperatureInfo.last_reading_of_termostat">
                <span class="reading-value">{{ temperatureInfo.last_reading_of_termostat }}°C</span>
                <span class="reading-label">Trenutna temperatura</span>
              </template>
              <template v-else>
                <span class="no-reading">--°C</span>
                <span class="reading-label">Nema očitavanja</span>
              </template>
            </div>
          </div>

          <div class="maintain-section">
            <div class="maintain-toggle">
              <FormInput v-model="maintainTermostat" :componentOptions="{ isBinary: true }" id="maintain_temperature"
                name="maintain_temperature" type="checkbox" class="maintain-checkbox" label="Održavaj temperaturu" />
            </div>
          </div>
        </div>
      </div>

      <div class="power-section">
        <div class="power-header">
          <h3>Kontrola uređaja</h3>
        </div>
        <div class="power-toggle">
          <ToggleButton v-model="checked" onLabel="Uključeno" offLabel="Isključeno" class="power-switch" />
        </div>
      </div>

      <div class="save-section">
        <ButtonMy :loading="isLoading" :disabled="isLoading" @click="submit()" class="save-btn" >
          Sačuvaj podešavanja
          <template #icon>
            <Icon icon="lsicon:save-outline" width="22" height="22" />
            </template>
        </ButtonMy>
      </div>
    </div>

    <div class="no-thermostat-card" v-else>
      <div class="no-therm-content">
        <i class="pi pi-thermometer no-therm-icon"></i>
        <h3>Nema termostata</h3>
        <p>Trenutno nema dodati termostat za uređaj <strong>{{ data.name }}</strong></p>
        <ButtonMy variant="glass" @click="showModalMy()">
          <template #icon>
            <Icon icon="ion:add" width="32" height="32" />
          </template>
          Dodaj termostat
        </ButtonMy>
      </div>
    </div>

    <Teleport to="body">
      <modal-layout :title="titleOfForm" :modal-content="modalContent" v-if="isOpen" :visible="isOpen" @close="ugasi()"
        @getDatas="setToStepRecivedData" @finish="sendAllData" :confirm="confDelete">
        <template #body>
          <SelectingFormView :buttons="textOnButton" v-if="activeForms === ''" @changeForms="setNewForms" />
          <TempDeviceForm :idDevice="dataLocal.id" v-if="activeForms === 'newTermo'" @close="ugasi()" />
          <TermostatFormCheck :idDevice="dataLocal.id"
            :idTermostat="dataLocal.termostat ? dataLocal.termostat.id : null" v-if="activeForms === 'existingTermo'"
            @close="ugasi()" />
        </template>
      </modal-layout>
    </Teleport>
  </div>
</template>

<script setup>
import EnergyConsumption from "@/components/ui/EnergyConsumption.vue";
import Knob from 'primevue/knob';
import Button from 'primevue/button';
import ToggleButton from 'primevue/togglebutton';
import modalLayout from '../modalLayout.vue';
import { showModal } from '../../composables/modal';
import { computed, defineProps, onUnmounted, ref, watch, inject, onMounted, nextTick } from 'vue';
import { useStore } from 'vuex';
import SelectingFormView from '@/features/others/selectingFormView.vue';
import TempDeviceForm from '@/features/devices/TempDeviceForm.vue';
import TermostatFormCheck from "@/features/termostat/TermostatFormCheck.vue";
import FormInput from "@/components/ui/FormInput.vue";
import { useToast } from 'vue-toastification';
import { PhGear } from '@phosphor-icons/vue';
import { Icon } from '@iconify/vue';
import ButtonMy from "../ui/ButtonMy.vue";

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});
const dataLocal = ref(props.data);
const isDragging = ref(false);
const previousTemperature = ref(0);
const isLoading = ref(false);

const dataLocalForComputed = computed(() => {
  return dataLocal.value;
})

const checked = ref(dataLocal.value.status);
const isDisabled = ref(false);
// Sav postojeći JavaScript kod ostaje isti
const activeForms = ref('');
const textOnButton = ref([{
  text: 'Dodaj novi termostat',
  icon: "carbon:temperature-celsius",
  modalId: 'newTermo'
}, {
  text: 'Dodaj vec postojeci termostat',
  icon: 'carbon:temperature-inversion',
  modalId: 'existingTermo'
}]);
// const showModals = ref(['newTermo','existingTermo']);
const titleOfForm = ref('');
const dragTimeout = ref(null);

const store = useStore();
const toast = useToast();

const temperatureInfo = computed(() => {
  return dataLocal.value.termostat || {};
})

const setNewForms = (selectedForms) => {
  if (selectedForms === 'newTermo') {
    titleOfForm.value = "Dodajte novi termostat";
  }
  else if (selectedForms === 'existingTermo') {
    titleOfForm.value = 'Izaberite termostat';
  }
  activeForms.value = selectedForms
};

const openSettings = () => {
  textOnButton.value = [{
    text: 'Izbrisi uređaj',
    icon: 'ep:delete',
    modalId: 'deleteConf'
  }, {
    text: 'Zameni termostat za uređaj',
    icon: 'carbon:temperature-inversion',
    modalId: 'existingTermo'
  }];
  show("Da li ste sigurni da želite da obrišete uređaj?", confDelete);
}

const confDelete = async (e) => {
  console.log(props.data.id);
}

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
  close();
}

onUnmounted(() => {
  if (dragTimeout.value) {
    clearTimeout(dragTimeout.value);
  }
  activeForms.value = "";
})
onMounted(() => {
  previousTemperature.value = changedTemperature.value;
})

watch(() => props.data, (newValue) => {
  dataLocal.value = newValue;
  const newTemp = newValue?.termostat?.desired_temperature ?? newValue?.termostat?.last_reading_of_termostat ?? 18;
  changedTemperature.value = newTemp
  previousTemperature.value = newTemp;
  maintainTermostat.value = Boolean(newValue?.termostat?.maintain_temperature);
})


//BITNO - logika za sprecavanje prevlacenja temperature ako je ispod 18 stepeni
watch(() => changedTemperature.value, (newValue, oldValue) => {
  console.log(`Temperatura se menja: ${oldValue} → ${newValue}`);

  // Ako se temperatura menja, znači da korisnik interaguje
  if (oldValue !== undefined && oldValue !== newValue) {

    // Označava da je drag u toku
    if (!isDragging.value) {
      isDragging.value = true;
      console.log('🟢 Drag started');
    }

    // Obriši postojeći timeout
    if (dragTimeout.value) {
      clearTimeout(dragTimeout.value);
    }

    if (newValue < 18) {

      // Spreči smanjivanje ispod 18
      nextTick(() => {
        if (changedTemperature.value < 18) {
          changedTemperature.value = 18;
          console.log('⚠️ Temperatura postavljena na minimum: 18°C');
        }

        // Onemogući komponentu samo dok korisnik vuče ispod minimuma
        if (isDragging.value) {
          isDisabled.value = true;
          console.log('🚫 Knob onemogućen');
        }
      });

    } else {
      console.log('🟢 Normalna temperatura:', newValue);
      // Omogući komponentu za normale vrednosti
      isDisabled.value = false;
    }

    // Postavi timeout da završi drag posle kratke pauze
    dragTimeout.value = setTimeout(() => {
      isDragging.value = false;
      isDisabled.value = false;
      console.log('✅ Drag completed, knob enabled');
    }, 150); // 150ms pauze nakon poslednje promene
  }

  // Ažuriraj previousTemperature
  previousTemperature.value = newValue;
}, { immediate: false });

const submit = async () => {
  isLoading.value = true;
  try {
    if (maintainTermostat.value) {
      console.log("Ovde otvorim modal sa porukom da su izabrali odrzavanje temperature ");
    }
    const dataForSend = {
      "status": checked.value,
      "desired_temperature": changedTemperature.value,
      "termostat_id": dataLocal.value.termostat.id,
      'maintain_temperature': maintainTermostat.value ? 1 : 0
    }
    store.commit('device/setSelectedType', selectedType.value);
    const response = await store.dispatch('device/setDataOfDeviceForTemperature', { data: dataForSend, id: dataLocal.value.id, });
    isLoading.value = false;
    toast.success(response.data.message, { timeout: 3000 });
  }
  catch (error) {
    isLoading.value = false;
    toast.error(error.message, { timeout: 3000 });
  }
}
</script>

<style scoped>
.custom-icon-color-for-energy {
  fill: yellow !important;
  color: yellow !important;
}

.option-header-block {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  align-items: center;
  cursor: pointer;
}

/* Glavni card */
.temp-card {
  background: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  color: #fff;
  max-width: 500px;
  margin: 0 auto;
}

/* Header */
.temp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.device-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  background: rgba(127, 0, 0, 0.8);
  color: #fff;
  border: 1px solid rgba(127, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.status-badge.active {
  background: rgba(0, 255, 0, 0.2);
  border-color: rgba(0, 255, 0, 0.5);
  color: rgba(0, 255, 0, 0.9);
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}

/* Kontrolni panel */
.temp-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Knob sekcija */
.knob-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.knob-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.temp-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.temp-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: #4caf50;
  line-height: 1;
}

.temp-label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 0.25rem;
}

.temp-buttons {
  display: flex;
  gap: 0.75rem;
}

.temp-btn {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  transition: all 0.3s ease !important;
}

.temp-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: scale(1.05);
}

/* Info panel */
.info-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.current-temp {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.temp-reading {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reading-value {
  font-size: 2rem;
  font-weight: 700;
  color: #4caf50;
  line-height: 1;
}

.no-reading {
  font-size: 2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1;
}

.reading-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.5rem;
}

/* Maintain sekcija */
.maintain-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.maintain-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

/* Power sekcija */
.power-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.power-header h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 500;
  color: #fff;
  text-align: center;
}

.power-toggle {
  display: flex;
  justify-content: center;
}

/* Save button */
.save-section {
  display: flex;
  justify-content: center;
}

.save-btn {
  background: linear-gradient(135deg, #4caf50, #45a049) !important;
  border: none !important;
  color: white !important;
  padding: 1rem 2rem !important;
  font-weight: 600 !important;
  border-radius: 12px !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3) !important;
  width: 100%;
}

.save-btn:hover {
  background: linear-gradient(135deg, #45a049, #3d8b40) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4) !important;
}

/* No thermostat state */
.no-thermostat-card {
  background: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 3rem 2rem;
  backdrop-filter: blur(10px);
  color: #fff;
  max-width: 400px;
  margin: 0 auto;
}

.no-therm-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-therm-icon {
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.5rem;
}

.no-therm-content h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.no-therm-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.add-thermostat-btn {
  margin-top: 1rem;
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.add-thermostat-btn:hover {
  background: linear-gradient(135deg, #45a049, #3d8b40);
  transform: translateY(-2px);
}

.temp-knob :deep(.p-knob-text) {
  display: none !important;
}

/* Responsive */
@media (max-width: 768px) {
  .temp-card {
    padding: 1rem;
    max-width: none;
    margin: 1rem;
  }

  .temp-controls {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .temp-header {
    flex-direction: column;
    gap: 0.2rem;
    text-align: center;
  }

  .temp-value {
    font-size: 1.5rem;
  }
}

/* PrimeVue override */
:deep(.p-togglebutton) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
}

:deep(.p-togglebutton.p-highlight) {
  background: rgba(76, 175, 80, 0.3) !important;
  border-color: #4caf50 !important;
  color: #4caf50 !important;
}
</style>