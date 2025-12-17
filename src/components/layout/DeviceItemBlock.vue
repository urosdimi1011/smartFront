<template>
  <div v-if="!data.is_out_of_range" @click.stop="handleClick" :data-id="data.id" class="lamp background-block"
    :class="deviceClasses">
    <div>
      <div class="info-section">
        <energy-consumption :today-stats="data.today_stats" :month-stats="data.month_stats"
          :energy-stats="data.energy_stats" :has-consumption="!!data.energy_stats"
          class="custom-icon-color-for-energy" />
        <info-tooltip class="color-info-button">
          <ul>
            <li>Board uredjaja: <strong>{{ data.board }}</strong></li>
            <li>Pin uredjaja: <strong>{{ data.pin }}</strong></li>
          </ul>
        </info-tooltip>
      </div>

      <div class="content-up">
        <ProgressSpinner v-if="isToggling" style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
          aria-label="Custom ProgressSpinner" />
        <div v-else>
          <component :is="iconComponent" :size="iconSize" :class="iconClass" />
          <div v-if="isThermostatDevice" class="small-thermostat">
            <Knob v-model="changedTemperature" :min="0" :max="30" :step="1" :width="160" :height="160"
              valueColor="#4caf50" rangeColor="#e0e0e0" :disabled="!checked"  class="temp-knob-large" />
            <div class="temp-display-small">
              <span>{{ changedTemperature }}°C</span>
            </div>
            <ToggleButton v-model="checked" onLabel="ON" offLabel="OFF" size="small" class="thermo-toggle" />
          </div>

          <div v-if="showInputField" class="name-block">
            <p>{{ data.name }}</p>
          </div>
          <div v-else class="form-change-input" @click.stop>
            <input ref="nameInput" type="text" id="nameOfDevice" v-model="tempName" @keyup.enter="changeName"
              @keyup.esc="cancelNameChange" />
            <ButtonMy class="color-button" @click.stop="changeName">
              <i class="fa-solid fa-check"></i>
            </ButtonMy>
          </div>
        </div>
      </div>

      <div class="content-down">
        <button class="down-button" @click.stop="toggleAdcConf">
          <i :class="{ rotate: doShowAdcConf }" class="fa-solid fa-arrow-down"></i>
        </button>
        <transition name="slidedown" mode="out-in">
          <div v-if="doShowAdcConf" class="content-conf" @click.stop>
            <button @click.stop="removeDevice">
              <p>
                <PhTrash :size="25" />
              </p>
            </button>
            <button @click.stop="changeNameOfInput">
              <p>
                <PhPencil :size="25" />
              </p>
            </button>
            <button v-if="data.hasBrightness" @click.stop="showConfigModal">
              <span><i class="fa-solid fa-gear"></i></span>
            </button>
          </div>
        </transition>
      </div>
    </div>

    <Teleport to="body">
      <modal-layout v-if="isOpen" :title="titleOfModal" :props="defineMyProps" :modalContent="modalContent"
        :confirm="confirm" :visible="isOpen" @close="close" />
    </Teleport>
  </div>

  <div v-else class="offline lamp background-block">
    <div class="info-section">
      <energy-consumption :today-stats="data.today_stats" :month-stats="data.month_stats"
        :energy-stats="data.energy_stats" :has-consumption="!!data.energy_stats" class="custom-icon-color-for-energy" />
      <info-tooltip>
        <ul>
          <li>Board uredjaja: <strong>{{ data.board }}</strong></li>
          <li>Pin uredjaja: <strong>{{ data.pin }}</strong></li>
        </ul>
      </info-tooltip>
    </div>
    <div class="content-up">
      <div class="outOfRange">
        <p><strong>{{ data.name }}</strong> je van mreže</p>
        <p>Vreme: {{ formattedDate }}</p>
        <p>
          <PhWifiX :size="32" />
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import Knob from 'primevue/knob';
import { ref, computed, nextTick, markRaw, defineOptions, defineProps, defineAsyncComponent } from 'vue';
const ModalLayout = defineAsyncComponent(() =>
  import('../modalLayout.vue')
);
import { showModal } from '../../composables/modal';
import { ProgressSpinner } from 'primevue';
import { PhPlugs, PhPlugsConnected, PhWifiX, PhTrash, PhPencil, PhLightbulb, PhLightbulbFilament } from "@phosphor-icons/vue";
import store from '@/store';
import { useToast } from 'vue-toastification';
const BrightnessLayout = defineAsyncComponent(() =>
  import('@/components/layout/BrightnessLayout.vue')
);
import InfoTooltip from "@/components/ui/InfoTooltip.vue";
import EnergyConsumption from "@/components/ui/EnergyConsumption.vue";

// Definišemo opcije komponente
defineOptions({
  memo: true,
  inheritAttrs: false
});

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

// Composables
const { isOpen, show, close, confirm, modalContent } = showModal();
const toast = useToast();

// Refs
const showInputField = ref(true);
const doShowAdcConf = ref(false);
const defineMyProps = ref([]);
const titleOfModal = ref("");
const isToggling = ref(false);
const tempName = ref(props.data.name);
const nameInput = ref(null);
const changedTemperature = ref(props.data.temperature || 20);

// Computed properties - memoized za bolju performansu
const active = computed(() => props.data.status);

const deviceClasses = computed(() => ({
  active: active.value,
  isToggling: isToggling.value,
  // offline: props.data.is_out_of_range
}));

const isThermostatDevice = computed(() => {
  console.log(['Cooling', 'Heating'].includes(props.data.category?.name));
  return ['Cooling', 'Heating'].includes(props.data.category?.name);
});

const iconComponent = computed(() => {
  if (props.data.category.name === 'Plug') {
    return props.data.status ? markRaw(PhPlugsConnected) : markRaw(PhPlugs);
  }
  if (props.data.category.name === 'Light') {
    return props.data.status ? markRaw(PhLightbulb) : markRaw(PhLightbulbFilament);
  }
  return null;
});

const iconSize = computed(() => 48);

const iconClass = computed(() => {
  if (props.data.category.name === 'Light' && props.data.status) {
    return 'light-on';
  }
  return '';
});

const formattedDate = computed(() => {
  if (!props.data.updated_date) return '';

  const date = new Date(props.data.updated_date);
  const dan = String(date.getUTCDate()).padStart(2, '0');
  const mesec = String(date.getUTCMonth() + 1).padStart(2, '0');
  const godina = date.getUTCFullYear();
  const sati = String(date.getUTCHours()).padStart(2, '0');
  const minuti = String(date.getUTCMinutes()).padStart(2, '0');
  return `${dan}.${mesec}.${godina}. ${sati}:${minuti}H`;
});

const handleClick = () => {
  toggleActive();
};

const toggleAdcConf = () => {
  doShowAdcConf.value = !doShowAdcConf.value;
};

const cancelNameChange = () => {
  tempName.value = props.data.name;
  showInputField.value = true;
};

const toggleActive = async () => {
  if (isToggling.value) return;

  isToggling.value = true;

  try {
    const data = {
      status: !active.value,
      id: props.data.board,
      pin: props.data.pin
    };

    await store.dispatch('device/changeStatusOfDevice', data);
    toast.success("Uspešno ste promenili status uređaja", { timeout: 3000 });
  } catch (error) {
    toast.error(error.message || 'Greška pri menjanju statusa uređaja', { timeout: 3000 });
  } finally {
    isToggling.value = false;
  }
};

const removeDevice = () => {
  titleOfModal.value = "Potvrda";
  show(`Da li ste sigurni da želite da obrišete uređaj ${props.data.name}?`, deleteDevice);
};

const showConfigModal = () => {
  defineMyProps.value = {
    id: props.data.id,
    brightness: props.data.brightness
  };
  titleOfModal.value = "Podesite osvetljenje";
  show(markRaw(BrightnessLayout));
};

const deleteDevice = async () => {
  try {
    await store.dispatch("device/deleteDevice", { id: props.data.id });
    toast.success("Uspešno ste obrisali uređaj", { timeout: 3000 });
  } catch (error) {
    toast.error(error.message || 'Greška pri brisanju uređaja', { timeout: 3000 });
  }
};

const changeNameOfInput = async () => {
  showInputField.value = !showInputField.value;

  if (!showInputField.value) {
    await nextTick();
    nameInput.value?.focus();
  }
};

const changeName = async () => {
  if (tempName.value === props.data.name) {
    showInputField.value = true;
    return;
  }

  const objToSend = {
    id: props.data.id,
    name: tempName.value
  };

  try {
    await store.dispatch("device/changeNameOfDevice", objToSend);
    showInputField.value = true;
    toast.success("Uspešno ste promenili ime", { timeout: 3000 });
  } catch (error) {
    toast.error(error.message || 'Greška pri menjanju imena', { timeout: 3000 });
  }
};
</script>

<style scoped>
.temp-knob-large {
  --knob-size: 160px;
}

.temp-knob-large :deep(.p-knob) {
  width: 160px !important;
  height: 160px !important;
}

.temp-display-large {
  font-size: 1.2rem; /* veći font za veću knob */
  font-weight: 600;
  color: #4caf50;
}

.thermo-toggle :deep(.p-togglebutton) {
  width: 70px;   /* malo veći toggle dugme */
  height: 35px;
  font-size: 0.85rem;
}

.thermo-toggle :deep(.p-togglebutton) {
  width: 60px;
  height: 30px;
  font-size: 0.75rem;
}

.color-info-button {
  color: #87c33e !important;
}

.color-button {
  background-color: #87c33e !important;
}

.custom-icon-color-for-energy {
  fill: yellow !important;
  color: yellow !important;
}

ul {
  list-style-type: none;
}

.form-change-input input {
  width: 100%;
  display: block;
}

.form-change-input button {
  width: 50%;
  display: block;
  padding: 3px 0px;
  margin: 15px 0px;

}

.form-change-input {
  padding-top: 10px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
}

.form-change-input button i {
  font-size: 25px;
}

.outOfRange p {
  color: black;
  text-align: center;
  width: 100%;
}

.outOfRange p:nth-of-type(3) {
  color: black !important;

}

.lamp {
  align-self: start;
  min-height: max-content;
  height: auto;
}

.lamp.offline {
  background-color: #ffe6e6;
  color: #d32f2f;
  border: 2px solid #f44336;
}

.form-change-input span i {
  font-size: 15px;
}

.name-block {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding-bottom: 20px;
}

.name-block i {
  font-size: 15px !important;
  vertical-align: middle;
}

.content-down {
  position: relative;
  border-top: 1px solid black;
  padding: 0px 10px;
}

.content-down i {
  font-size: 15px;
  padding-top: 4px;
}

.content-conf {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.content-conf button {
  background-color: transparent;
  padding: 18px 15px;
  width: 40%;
  margin-bottom: 4px;
  border-radius: 8%;
  cursor: pointer;
}

.lamp .content-conf button p {
  margin-top: 0px;
}

.content-conf button:nth-child(1) {
  background-color: red;
}

.content-conf button:nth-child(2) {
  background-color: green;
}

.content-conf button:nth-child(3) {
  background-color: #cbcbcb;
}

.content-conf i {
  padding: 0px;
  color: white;
  font-size: 20px;
}

.down-button {
  width: 100%;
  color: black;
  padding: 10px 0px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 300ms;
}

.rotate {
  transform: rotate(180deg);
}

.down-button:has(> .rotate) {
  padding-top: 10px;
}

.content-up {
  min-height: 6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.active {
  border: 1px solid white;
}

.isToggling {
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.info-section {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 0.5rem;
}
</style>