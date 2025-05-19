<template>
  <div class="p-4 space-y-4">
    <template v-if="timers && timers.length > 0">
      <div v-for="timer in timers" :key="timer.id" class="timer-row">
        <div class="text-base font-medium truncate">{{ timer.name }}</div>
        <div class="text-base font-medium truncate">{{ formatTime(timer.time) }}</div>

        <!-- Status -->
        <div class="text-right text-sm text-blue-600">
          <button @click="openDialog(timer)">Detalji</button>
        </div>

        <div class="flex justify-center">
          <ToggleSwitch :modelValue="Boolean(timer.active)" @update:modelValue="(val) => toggleStatus(timer, val)" />
        </div>
      </div>
    </template>
    <template v-else>
      <p>Trenutno nema setovanih tajmera</p>
    </template>

    <!-- Dialog -->
    <Dialog v-model:visible="dialogVisible" modal header="Detalji tajmera" :style="{ width: '90vw' }">
      <div v-if="editedTimer" class="space-y-2 text-sm">
        <!-- Uređaji -->
        {{timer}}
        <div>
          <strong>Uređaji:</strong>
          <span v-if="!editingField" class="cursor-pointer text-blue-600 hover:underline">
            {{ formatDevices(selectedTimer.devices) }}
          </span>
          <MultiSelect
              v-else
              v-model="selectedDevicesIds"
              :options="availableDevices"
              optionLabel="name"
              optionValue="id"
              placeholder="Izaberi uređaje"
              class="w-moj"
          />
        </div>

        <!-- Dani -->
        <div>
          <strong>Dani:</strong>
          <span v-if="!editingField" class="cursor-pointer text-blue-600 hover:underline">
            {{ formatDevices(selectedTimer.days) }}
          </span>
          <MultiSelect
              v-else
              v-model="selectedDayIds"
              :options="availableDays"
              optionLabel="name"
              optionValue="id"
              placeholder="Izaberi dane"
              class="w-moj"
          />
        </div>

        <!-- Vreme -->
        <div>
          <strong>Vreme:</strong>
          <span v-if="!editingField" class="cursor-pointer text-blue-600 hover:underline">
            {{ selectedTimer.time }}
          </span>
          <input
              v-else
              type="time"
              v-model="editedTimer.time"
              class="border p-1 rounded"
          />
        </div>

        <!-- Status -->
        <div>
          <strong>Akcija tajmera:</strong>
          <span v-if="!editingField" class="cursor-pointer text-blue-600 hover:underline">
            {{ selectedTimer.status ? 'Uključivanje' : 'Isključivanje' }}
          </span>
          <select
              v-else
              v-model="editedTimer.status"
              class="border p-1 rounded"
          >
            <option :value="1">Uključivanje</option>
            <option :value="0">Isključivanje</option>
          </select>
        </div>

        <!-- Dugme za čuvanje izmena -->
        <div class="pt-2 text-right">
          <button-my v-if="editingField" @click="saveChanges" class="form-button">
            Sačuvaj izmene
          </button-my>
          <button-my v-else @click="startEditing" class="form-button">
            Izmeni
          </button-my>
          <button-my v-if="editingField" @click="stopEditing" class="form-button">
            Poništi izmenu
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

const dialogVisible = ref(false);
const selectedTimer = ref(null);
const editedTimer = ref(null);
const editingField = ref(false);
const toast = useToast();
const selectedDayIds = ref([]);
const selectedDevicesIds = ref([]);
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
  await getDevices(); // ako koristiš uređaje iz stor-a
});

const getAllTimers = async () => {
  try {
    await store.dispatch('timer/getAll');
  } catch (error) {
    toast.error(error.message);
  }
};

const getDevices = async () => {
  try {
    await store.dispatch('device/getAll');
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
  selectedDevicesIds.value = timer.devices.map(d=>d.id);
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
    const response = await store.dispatch("timer/changeTimer", updated);
    toast.success("Izmene su sačuvane!");
    await getAllTimers();
    dialogVisible.value = false;
  } catch (error) {
    toast.error("Greška pri čuvanju izmena.");
  }
};
</script>

<style scoped>
.timer-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  gap: 1rem;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s ease;
}
.timer-row:hover {
  background-color: #f9fafb;
}
.space-y-2 {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-button{
  margin-top: 0.5rem;
}
.w-button{
  margin-top: 0.5rem;
  width:30%;
}
.w-moj{
  margin-top: 0.5rem;
  width: 100%;
}
</style>
