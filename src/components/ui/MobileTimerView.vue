<template>
  <div class="mobile-timer-view p-4 space-y-4">
    <template v-if="isLoading">
      <div class="spinner-layout">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
          aria-label="Custom ProgressSpinner" />
      </div>
    </template>
    <template v-else-if="timers && timers.length > 0">
      <div v-for="timer in timers" :key="timer.id" class="timer-row"
        :class="{ timerRowFor5: showCheckBoxForDeleteTimers }">
        <div class="text-base font-medium truncate" v-if="showCheckBoxForDeleteTimers">
          <FormInput class="custom-my-padding-0" :value="timer.id" :id="timer.id" v-model="selectedTimers" name="timers"
            type="checkbox" />
        </div>
        <div class="text-base font-medium truncate">{{ timer.name }}</div>
        <div class="text-base font-medium truncate">{{ formatTime(timer.time) }}</div>

        <div class="text-right text-sm text-blue-600">
          <ButtonMy class="font-small" variant="glass" @click="openDialog(timer)">Detalji
            <template #icon>
              <Icon icon="material-symbols:info-outline" width="16" height="16" />
            </template>
          </ButtonMy>
        </div>
        <div class="flex justify-center">
          <ToggleSwitch :modelValue="Boolean(timer.active)" @update:modelValue="(val) => toggleStatus(timer, val)" />
        </div>
      </div>
      <div class="group-button">
        <button-my :disabled="showCheckBoxForDeleteTimers && !hasSelectedTimers" variant="glass"
          @click="showCheckBoxForDeleteTimers ? removeTimers() : showCheckBoxForDeleting()" class="form-button">
          {{ showCheckBoxForDeleteTimers ? "Potvrdi" : "Obriši tajmere" }}
          <template #icon>
            <Icon :icon="showCheckBoxForDeleteTimers ? 'material-symbols:check-circle-outline' : 'mdi:timer-cancel'"
              width="22" height="22" />
          </template>
        </button-my>
        <template v-if="showCheckBoxForDeleteTimers">
          <button-my variant="glass" @click="showCheckBoxForDeleting()" class="form-button">
            Otkaži
            <template #icon>
              <Icon icon="material-symbols-light:cancel-outline-rounded" width="22" height="22" />
            </template>
          </button-my>
        </template>
      </div>
    </template>
    <template v-else>
      <p>Trenutno nema setovanih tajmera</p>
    </template>

    <Dialog v-model:visible="dialogVisible" modal header="Detalji tajmera" :style="{ width: '90vw' }" class="p-dialog">
      <div v-if="editedTimer" class="space-y-2 text-sm">
        {{ timer }}
        <div>
          <strong>Uređaji:</strong>
          <span v-if="!editingField" class="cursor-pointer text-blue-600 hover:underline">
            {{ formatDevices(selectedTimer.devices) }}
          </span>
          <MultiSelect v-else v-model="selectedDevicesIds" :options="availableDevices" optionLabel="name"
            optionValue="id" placeholder="Izaberi uređaje" class="w-moj" />
        </div>

        <div>
          <strong>Dani:</strong>
          <span v-if="!editingField" class="cursor-pointer text-blue-600 hover:underline">
            {{ formatDevices(selectedTimer.days) }}
          </span>
          <MultiSelect v-else v-model="selectedDayIds" :options="availableDays" optionLabel="name" optionValue="id"
            placeholder="Izaberi dane" class="w-moj" />
        </div>

        <div>
          <strong>Vreme:</strong>
          <span v-if="!editingField" class="cursor-pointer text-blue-600 hover:underline">
            {{ selectedTimer.time }}
          </span>
          <input v-else type="time" v-model="editedTimer.time" class="border p-1 rounded klasa-moja" />
        </div>

        <div>
          <strong>Akcija tajmera:</strong>
          <span v-if="!editingField" class="cursor-pointer text-blue-600 hover:underline">
            {{ selectedTimer.status ? 'Uključivanje' : 'Isključivanje' }}
          </span>
          <select v-else v-model="editedTimer.status" class="border p-1 rounded klasa-moja">
            <option :value="1">Uključivanje</option>
            <option :value="0">Isključivanje</option>
          </select>
        </div>
        <div class="pt-2 text-right">
          <div class="group-button" v-if="editingField">
            <button-my variant="success" @click="saveChanges" class="form-button">
              Sačuvaj izmene
            </button-my>
            <button-my variant="danger" @click="stopEditing" class="form-button">
              Poništi izmenu
            </button-my>
          </div>
          <button-my v-else @click="startEditing" class="form-button">
            Izmeni
          </button-my>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ToggleSwitch from 'primevue/toggleswitch';
import MultiSelect from 'primevue/multiselect';
import Dialog from 'primevue/dialog';
import store from '@/store';
import { useToast } from 'vue-toastification';
import FormInput from "@/components/ui/FormInput.vue";
import ButtonMy from './ButtonMy.vue';
import { ProgressSpinner } from 'primevue';
import { Icon } from '@iconify/vue';

const dialogVisible = ref(false);
const selectedTimer = ref(null);
const editedTimer = ref(null);
const editingField = ref(false);
const showCheckBoxForDeleteTimers = ref(false);
const toast = useToast();
const selectedDayIds = ref([]);
const selectedDevicesIds = ref([]);
const selectedTimers = ref([]);
const isDeleting = ref(false);
const isLoading = ref(false);

const timers = computed(() => store.getters['timer/getListOfTimer']);
const availableDevices = computed(() => store.getters['device/getAllDevices'] || []);
const availableDays = ref([
  { id: 1, name: 'Ponedeljak' },
  { id: 2, name: 'Utorak' },
  { id: 3, name: 'Sreda' },
  { id: 4, name: 'Četvrtak' },
  { id: 5, name: 'Petak' },
  { id: 6, name: 'Subota' },
  { id: 7, name: 'Nedelja' },
]);

onMounted(async () => {
  await getAllTimers();
  await getDevices();
});

const getAllTimers = async () => {
  try {
    isLoading.value = true;
    await store.dispatch('timer/getAll');
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
    toast.error(error.message);
  }
};
const showCheckBoxForDeleting = () => {
  showCheckBoxForDeleteTimers.value = !showCheckBoxForDeleteTimers.value;
}
const removeTimers = async () => {
  if (isDeleting.value) return;
  if (!selectedTimers.value.length) {
    toast.error("Prvo izaberite tajmere koje želite da obrišete", { timeout: 2000 });
    return;
  }
  isDeleting.value = true;
  try {
    await store.dispatch("timer/deleteTimers", selectedTimers.value)
    toast.success("Uspesno se obrisali tajmera", { timeout: 2000 });
    selectedTimers.value = [];
  }
  catch (error) {
    toast.error(error.message, { timeout: 2000 });
  }
  finally {
    showCheckBoxForDeleteTimers.value = false;
    isDeleting.value = false;
  }
}
const getDevices = async () => {
  try {
    await store.dispatch('device/getAllDevices', { showGlobalLoading: false });
  } catch (error) {
    toast.error(error.message);
  }
};

const formatDevices = (arr) => {
  if (!arr || !arr.length) return 'Nema';
  return arr.map(x => x.name).join(', ');
};

const formatTime = (time) => {
  if (!time) return '';
  return time.split(':').slice(0, 2).join(':');
};

const toggleStatus = async (timer, val) => {
  const updated = {
    ...timer,
    active: val ? 1 : 0,
    idsDevice: timer.devices.map(d => d.id),
    idsDays: timer.days.map(d => d.id)
  };
  try {
    const response = await store.dispatch("timer/changeActivity", updated);
    toast.success(response.data.message);
  } catch (e) {
    toast.error(e.message);
  }
};

const startEditing = () => {
  editingField.value = true;
};

const stopEditing = () => {
  editedTimer.value.days = availableDays.value.filter(day =>
    selectedDayIds.value.includes(day.id)
  );
  editedTimer.value.devices = availableDevices.value.filter(day =>
    selectedDevicesIds.value.includes(day.id)
  );
  editingField.value = false;
};

const openDialog = (timer) => {
  selectedTimer.value = timer;
  selectedDayIds.value = timer.days.map(d => d.id);
  selectedDevicesIds.value = timer.devices.map(d => d.id);
  editedTimer.value = {
    ...timer,
    devices: [...timer.devices],
    days: [...timer.days],
    status: Number(timer.status)
  };
  editingField.value = false;
  dialogVisible.value = true;
};

const saveChanges = async () => {
  try {
    const updated = {
      ...editedTimer.value,
      idsDevice: selectedDevicesIds.value,
      idsDays: selectedDayIds.value
    };
    await store.dispatch("timer/changeTimer", updated);
    toast.success("Izmene su sačuvane!");
    await getAllTimers();
    dialogVisible.value = false;
  } catch (error) {
    toast.error(error.message || "Greška pri čuvanju izmena.");
  }
};

const hasSelectedTimers = computed(() => {
  console.log(selectedTimers.value.length)
  return !!selectedTimers.value.length;
});
</script>

<style scoped>
:deep(.form-group .custom-checkbox) {
  padding: 0 !important;
}

.timer-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  gap: 1rem;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s ease;
}

@media (prefers-color-scheme: dark) {

  .timer-row:hover {
    background-color: #002141 !important;
  }

  .p-dialog {
    background-color: #00293E !important;
  }

  .klasa-moja {
    background-color: #00293E !important;
  }
}

:root {
  --dialog-bg: #ffffff;
  --dialog-header-bg: #f8f9fa;
  --dialog-text: #000000;
  --dialog-border: #dee2e6;
}

/* Dark mode varijable */
@media (prefers-color-scheme: dark) {

  :root {
    --dialog-bg: #1a1a1a;
    --dialog-header-bg: #2d2d2d;
    --dialog-text: #ffffff;
    --dialog-border: #404040;
  }
}

/* Primena na Dialog */
.p-dialog {
  background-color: var(--dialog-bg) !important;
  border: 1px solid var(--dialog-border) !important;
  color: var(--dialog-text) !important;
}

.p-dialog .p-dialog-header {
  background-color: var(--dialog-header-bg) !important;
  color: var(--dialog-text) !important;
  border-bottom: 1px solid var(--dialog-border) !important;
}

.p-dialog .p-dialog-content {
  background-color: var(--dialog-bg) !important;
  color: var(--dialog-text) !important;
}

.timerRowFor5 {
  grid-template-columns: repeat(5, 1fr) !important;
}

.timer-row:hover {
  background-color: #f9fafb;
}

.space-y-2 {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-button {
  margin-top: 0.5rem;
}

.w-button {
  margin-top: 0.5rem;
  width: 30%;
}

.w-moj {
  margin-top: 0.5rem;
  width: 100%;
}

.group-button {
  display: flex;
  gap: 1rem;
}

.group-button button {
  align-self: center;
}

.font-small {
  font-size: 12px;
  min-height: 30px;
  padding: 0px 5px;
  width: 100%;
  margin-top: 0px !important;
}

.spinner-layout {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
