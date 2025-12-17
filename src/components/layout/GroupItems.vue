<template>
  <div class="group-items background-block" :class="groupClasses">
    <div class="header-group-content">
      <div class="remove-group-block">
        <button v-if="showButtonOfTurnAll && removeOption" @click="confirmDelete" class="remove-group close-button">
          <PhClosedCaptioning></PhClosedCaptioning>
        </button>
        <info-tooltip v-if="showButtonOfTurnAll && devicesExist" :disabled="!doesDeviceOutOfRange">
          <template #icon>
            <ButtonMy @click="handleTurnAllClick" class="activeAll"
              variant="glass">
              <PhCheck v-if="devicesAllTurn" :size="32" />
              <PhPower v-else :size="32" />
            </ButtonMy>
          </template>
          <p>Trenutno ne možete da upalite ili ugasite uređaje, verovatno su neki ili svi van mreže</p>
        </info-tooltip>
      </div>
      <h3 v-if="!doesChangeGroupName" class="header-group">
        {{ groupName }} <slot name="icon"></slot>
        <span v-if="doesChangeGroupNameProps" @click="changeGroupNameFunc" class="edit-icon">
          <PhPencil :size="20" />
        </span>
      </h3>

      <div v-else class="inline-edit-wrapper">
        <input ref="groupNameInput" v-model="newGroupName" type="text" class="inline-input"
          @keyup.enter="changeGroupName" @keyup.esc="cancelGroupNameChange" />
        <button @click="changeGroupName" class="confirm-btn">
          <PhCheckSquare :size="25" weight="thin" />
        </button>
        <button @click="cancelGroupNameChange" class="cancel-btn">
          <PhXSquare :size="25" weight="light" />
        </button>
      </div>

    </div>

    <div class="line-block">
      <hr />
      <span class="load-line"></span>
    </div>

    <div @click="toggleMenu" class="down-group-items">
      <i class="fa-solid fa-arrow-down"></i>
    </div>

    <transition name="slidedown" mode="out-in" @enter="onEnter" @leave="onLeave">
      <div v-if="hasDevices && shouldShowMenu" class="devices-container" :class="{ 'mobile-optimized': isMobile }">
        <div class="slide-menu main">
          <item-block v-for="device in safeDevices" :key="`device-${device.id}`" :data="device" />
        </div>
        <div v-if="addDeviceOptions" class="add-device-section ">
          <ButtonMy variant="glass" class="add-device-button " @click="editDevice()">
            Dodaj uređaj
            <template #icon>
              <Icon icon="ion:add-outline" width="22" height="22" />
            </template>
          </ButtonMy>
        </div>
      </div>

      <div v-else-if="isEmpty && shouldShowMenu" class="empty-state devices-container"
        :class="{ 'mobile-optimized': isMobile }">
        <p class="text-info">Trenutno nemate uređaje u grupi</p>
        <div v-if="addDeviceOptions" class="add-device-section ">
          <ButtonMy variant="glass" class="add-device-button " @click="editDevice()">
            Dodaj uređaj
            <template #icon>
              <Icon icon="ion:add-outline" width="22" height="22" />
            </template>
          </ButtonMy>
        </div>
      </div>

      <div v-else-if="isLoading" class="loading-state">
        <Skeleton v-for="n in 3" :key="n" height="80px" class="mb-3" borderRadius="10px" />
      </div>


    </transition>

    <Teleport to="body">
      <modal-layout v-if="isOpen" :title="titleOfModal" :modal-content="modalContent" :confirm="confirm"
        :visible="isOpen" @close="closeModal">
        <template #body>
          <SelectingFormView v-if="activeForms == 'select'" :buttons="textOnButton" @changeForms="setNewForms" />
          <DeviceForm v-else-if="activeForms === 'newDevice'" :idGrupe="id" />
          <DeviceFormCheckBox v-else-if="activeForms === 'addDevice'" :idGrupe="id" stepForm @changeForms="setNewForms"
            @close="closeModal" />
        </template>
      </modal-layout>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, markRaw, defineProps, onMounted, onUnmounted, watch } from 'vue';
import itemBlock from './itemBlock.vue';
import modalLayout from '../modalLayout.vue';
import { showModal } from '@/composables/modal';
import SelectingFormView from '@/features/others/selectingFormView.vue';
import DeviceForm from '@/features/devices/DeviceForm.vue';
import DeviceFormCheckBox from '@/features/devices/DeviceFormCheckBox.vue';
import store from '@/store';
import { useToast } from 'vue-toastification';
import ButtonMy from "@/components/ui/ButtonMy.vue";
import { PhCheck, PhPencil, PhPower, PhCheckSquare, PhXSquare, PhClosedCaptioning, PhPlus } from "@phosphor-icons/vue";
import InfoTooltip from "@/components/ui/InfoTooltip.vue";
import { debounce } from 'lodash-es';
import { Skeleton } from 'primevue';
import { Icon } from '@iconify/vue';

const isMobile = ref(false);

onMounted(() => {
  isMobile.value = window.innerWidth <= 768;

  const handleResize = () => {
    isMobile.value = window.innerWidth <= 768;
  };

  window.addEventListener('resize', handleResize);

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
});

const props = defineProps({
  devices: {
    type: Array,
    required: false,
    default: () => [],
    validator: (value) => {
      return value === null || value === undefined || Array.isArray(value);
    }
  },
  showButtonOfTurnAll: {
    type: Boolean,
    default: true
  },
  automaticOpen: {
    type: Boolean,
    default: false
  },
  addDeviceOptions: {
    type: Boolean,
    default: true
  },
  doesChangeGroupNameProps: {
    type: Boolean,
    default: true
  },
  groupName: {
    type: String,
    required: true
  },
  removeOption: {
    type: Boolean,
    required: false,
    default: true
  },
  id: {
    type: Number,
    required: true
  }
});


const isLoading = computed(() => {
  // Loading je kada devices nije ni array ni null - znači još uvek čeka podatke
  return props.devices === undefined;
});

const isEmpty = computed(() => {
  // Prazan je kada je eksplicitno prazan array
  console.log(props.devices);
  return Array.isArray(props.devices) && props.devices.length === 0;
});

const hasDevices = computed(() => {
  // Ima devices kada je array sa elementima
  return Array.isArray(props.devices) && props.devices.length > 0;
});

const toast = useToast();
const { isOpen, show, close, modalContent, confirm } = showModal();

const showMenuProp = ref(false);
const isClass = ref(false);
const activeForms = ref('');
const doesChangeGroupName = ref(false);
const showTooltip = ref(false);
const newGroupName = ref(props.groupName);
const groupNameInput = ref(null);

const titleOfModal = ref('');
const textOnButton = ref([{
  text: 'Dodaj novi uredjaj',
  icon: 'carbon:data-enrichment-add',
  modalId: 'newDevice'
},
{
  text: 'Izmeni sa već postojećim uređajima',
  icon: 'mdi-light:plus-box',
  modalId: 'addDevice'
}]);
// const icons = ref(['mdi:new-box', 'mdi-light:plus-box']);
// const showModals = ref(['newDevice', 'addDevice']);

// refs for DOM nodes
const headerRef = ref(null);
const turnAllBtnRef = ref(null);
const tooltipRef = ref(null);
const tooltipPosition = ref(null);

function updateTooltipPosition() {
  // Compute tooltip fixed viewport coordinates and pass them via manualPosition
  nextTick(() => {
    const btn = turnAllBtnRef.value;
    if (!btn) {
      // retry shortly if ref not yet set
      setTimeout(updateTooltipPosition, 40);
      return;
    }

    // turnAllBtnRef may point to a component instance. Get its root element if necessary.
    let btnEl = null;
    try {
      if (typeof btn.getBoundingClientRect === 'function') btnEl = btn;
      else if (btn.$el && typeof btn.$el.getBoundingClientRect === 'function') btnEl = btn.$el;
      else if (btn.$el && btn.$el.$el && typeof btn.$el.$el.getBoundingClientRect === 'function') btnEl = btn.$el.$el;
    } catch (e) {
      btnEl = null;
    }

    if (!btnEl) {
      // Retry once more shortly — sometimes component root isn't available immediately
      setTimeout(updateTooltipPosition, 40);
      return;
    }

    const btnRect = btnEl.getBoundingClientRect();
    const tooltipWidth = Math.min(260, Math.floor(window.innerWidth * 0.9));
    const gap = 6; // small gap between button and tooltip

    let top = Math.floor(btnRect.bottom + gap);
    let left = Math.floor(btnRect.right - tooltipWidth);

    // Clamp left to visible viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));

    tooltipPosition.value = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      minWidth: `${tooltipWidth}px`,
      maxWidth: '90vw',
      zIndex: 10000
    };
  });
}


watch(() => showTooltip.value, async (val) => {
  if (val) {
    await nextTick();
    updateTooltipPosition();
    // Ensure position is applied after Teleport mounts: retry on next animation frame
    requestAnimationFrame(() => {
      updateTooltipPosition();
    });
  }
});

const editDevice = () => {
  activeForms.value = 'select';
  show();
}

const safeDevices = computed(() => {
  console.log(props.devices && props.devices.length == 0);
  return props.devices || [];
});

const devicesExist = computed(() =>
  safeDevices.value && safeDevices.value.length > 0
);

const groupClasses = computed(() => ({
  scale: isClass.value || props.automaticOpen,
  glowEffect: devicesAllTurn.value
}));

const shouldShowMenu = computed(() =>
  showMenuProp.value || props.automaticOpen
);

const shouldShowTooltip = computed(() =>
  doesDeviceOutOfRange.value && showTooltip.value
);

const doesDeviceOutOfRange = computed(() =>
  safeDevices.value.some(device => device.is_out_of_range)
);

const devicesAllTurn = computed(() => {
  if (!devicesExist.value) return false;
  return safeDevices.value.every(device => device.status);
});

// Event handlers
const toggleMenu = () => {
  showMenuProp.value = !showMenuProp.value;
  isClass.value = !isClass.value;
};

const hideTooltip = (show) => {
  showTooltip.value = show;
};

const handleTurnAllClick = () => {
  if (!doesDeviceOutOfRange.value) {
    turnOnAllDebounced();
  } else {
    showTooltip.value = !showTooltip.value;
  }
};

const onEnter = (el) => {
  el.style.transform = 'translateZ(0)';
  el.style.backfaceVisibility = 'hidden';
  el.style.perspective = '1000px';
};

const onLeave = (el) => {
  el.style.transform = '';
  el.style.backfaceVisibility = '';
  el.style.perspective = '';
};

const turnOnAllDebounced = debounce(turnOnAll, 300);

function turnOnAll() {
  activeForms.value = '';
  const shouldTurnOn = !devicesAllTurn.value;
  titleOfModal.value = 'Kontrola uređaja';
  show(
    `Da li želite sve uređaje da ${shouldTurnOn ? 'upalite' : 'ugasite'}?`,
    () => turnAllDevice(shouldTurnOn)
  );
}

// Async funkcije
const turnAllDevice = async (shouldTurnOn) => {
  try {
    await store.dispatch("device/changeStautsOfDeviceInGroup", {
      status: shouldTurnOn,
      id: props.id,
      ids: props.devices.map((x) => x.id)
    });
    toast.success('Uspešno ste promenili status uređaja u grupi', { timeout: 3000 });
  } catch (error) {
    toast.error(error.message || 'Greška pri menjanju statusa uređaja', { timeout: 3000 });
  }
};

const removeGroup = async () => {
  try {
    await store.dispatch("group/RemoveGroup", props.id);
    toast.success('Uspešno ste obrisali grupu', { timeout: 3000 });
  } catch (error) {
    toast.error(error.message || 'Greška pri brisanju grupe', { timeout: 3000 });
  }
};

const confirmDelete = () => {
  activeForms.value = '';
  titleOfModal.value = 'Pitanje';
  show(
    `Da li ste sigurni da želite da obrišete grupu "${props.groupName}"?`,
    removeGroup
  );
};

const changeGroupName = async () => {
  if (props.groupName === newGroupName.value) {
    doesChangeGroupName.value = false;
    return;
  }

  const data = {
    name: newGroupName.value,
    id: props.id
  };

  try {
    await store.dispatch('group/changeGroupName', data);
    toast.success('Uspešno ste izmenili naziv grupe', { timeout: 3000 });
    doesChangeGroupName.value = false;
  } catch (error) {
    toast.error(error.message || 'Greška pri menjanju naziva grupe', { timeout: 3000 });
  }
};

const changeGroupNameFunc = async () => {
  newGroupName.value = props.groupName;
  doesChangeGroupName.value = !doesChangeGroupName.value;

  if (doesChangeGroupName.value) {
    await nextTick();
    groupNameInput.value?.focus();
  }
};

const cancelGroupNameChange = () => {
  newGroupName.value = props.groupName;
  doesChangeGroupName.value = false;
};

// Modal funkcije
const closeModal = () => {
  activeForms.value = "";
  close();
};

const setNewForms = (selectedForm) => {
  titleOfModal.value = selectedForm === 'newDevice'
    ? "Dodaj uređaj"
    : 'Izaberi uređaj';
  activeForms.value = selectedForm;
};
</script>

<style scoped>
.header-group-content {
  color: #fff;
  font-size: 30px;
  display: flex;
  justify-content: space-between;
  min-height: 120px;
  align-items: center;
  flex-wrap: wrap;
  contain: layout style;
}

.slide-menu {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  contain: layout style paint;
  padding-bottom: 3vh;
}

.mobile-optimized {
  /* Dodatne optimizacije za mobilne uređaje */
  transform: translate3d(0, 0, 0);
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden;
  -webkit-perspective: 1000px;
}

.slidedown-enter-active,
.slidedown-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top center;
  will-change: transform, opacity;
}

.slidedown-enter-from {
  opacity: 0;
  transform: translateY(-20px) scaleY(0.8);
}

.slidedown-enter-to {
  opacity: 1;
  transform: translateY(0) scaleY(1);
}

.slidedown-leave-from {
  opacity: 1;
  transform: translateY(0) scaleY(1);
}

.slidedown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scaleY(0.9);
}

.w-100 {
  width: 100%;
}

.d-flex-center {
  display: flex;
  justify-content: center;
}

.text-info {
  color: #fff;
  font-size: 15px;
  text-align: center;
  margin-bottom: 10px;
}

.remove-group {
  position: absolute;
  top: 7px;
  left: 7px;
  cursor: pointer;
}

.glowEffect {
  box-shadow: 0 0 20px 2px #fff;
}

.line-block {
  position: relative;
  overflow: hidden;
}

.line-block hr {
  margin: 0;
  border: none;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

.scale .load-line {
  width: 100%;
  box-shadow:
    0 0 15px rgba(74, 222, 128, 0.6),
    0 0 30px rgba(74, 222, 128, 0.3);
}

.scale .load-line::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0;
    transform: scaleX(0.5);
  }

  50% {
    opacity: 1;
    transform: scaleX(1);
  }
}

.load-line {
  display: block;
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e, #16a34a);
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
  border-radius: 2px;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
}

.scale .load-line {
  width: 100%;
}

.scale {
  transform: scale(1.02);
}

.down-group-items {
  cursor: pointer;
  text-align: center;
}

.scale .fa-arrow-down {
  transform: rotate(180deg);
}

.down-group-items i {
  color: white;
  font-size: 20px;
  padding: 15px 0px;
  transition: all 500ms;
}

.header-group {
  width: 80%;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: 15px;
  font-weight: 400 !important;
  text-shadow:
    0px 1px 1px rgba(0, 0, 0, 0.1),
    0px 1px 2px rgba(0, 0, 0, 0.1),
    0px 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 1.1rem;
}

.header-group i {
  font-size: 25px;
  cursor: pointer;
}

.group-items {
  margin: 0px auto;
  margin-top: 50px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  transition: all 300ms;
  position: relative;
}

button {
  background-color: transparent;
  outline: none;
  border: none;
  width: max-content;
  display: inline-block;
  margin-top: 0px;
  color: #fff;
}

.py-5 {
  padding: 10px;
}

.remove-group-block {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.activeAll {
  position: relative;
  margin-left: auto;
  margin-right: 10px;
  border: 1px solid #fff;
  width: 3vw;
  height: 5vh;
  padding: 10px;
}

.activeAll svg {
  width: 22px;
  height: 22px;
}

.inline-edit-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.inline-input {
  font-size: 1.125rem;
  font-weight: 500;
  color: #fff;
  border: none;
  border-bottom: 1px solid #d1d5db;
  outline: none;
  background: transparent;
  padding: 2px 4px;
  transition: border-color 0.2s;
  margin-left: 15px;
  width: 56%;
}

.inline-input:focus {
  border-color: #3b82f6;
}

.confirm-btn,
.cancel-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: transform 0.15s ease;
}

.confirm-btn:hover,
.cancel-btn:hover {
  transform: scale(1.1);
}


.add-device-section {
  width: max-content;
  margin: 0px auto;
  cursor: pointer;
}

.add-device-button {
  display: flex;
  align-items: center;
  gap: 1em;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  width: 100%;
}

.devices-container {
  padding-bottom: 1rem;
}

.loading-state {
  width: max-content;
  margin: 0px auto;
}
</style>