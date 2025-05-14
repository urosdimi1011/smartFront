<template>
  <div class="p-4 space-y-4">
    <template v-if="timers && timers.length>0">
      <div v-for="timer in timers" :key="timer.id"
           class="timer-row">

        <!-- Naziv tajmera -->
        <div class="text-base font-medium truncate">
          {{ timer.name }}
        </div>
        <div class="text-base font-medium truncate">
          {{ formatTime(timer.time) }}
        </div>
        <!-- Status -->
        <div class="text-right text-sm text-blue-600">
          <button @click="openDialog(timer)">Detalji</button>
        </div>
        <div class="flex justify-center">
          <ToggleSwitch
              :modelValue="Boolean(timer.status)"
              @update:modelValue="(val) => toggleStatus(timer, val)"
          />
        </div>
      </div>
    </template>
    <template v-else>
        <p>Trenutno nema setovanih tajmera</p>
    </template>
    <Dialog v-model:visible="dialogVisible" modal header="Detalji tajmera" :style="{ width: '90vw' }">
      <div v-if="selectedTimer" class="space-y-2 text-sm">
        <div><strong>Uređaji:</strong> {{ formatDevices(selectedTimer.devices) }}</div>
        <div><strong>Dani:</strong> {{ formatDevices(selectedTimer.days) }}</div>
        <div><strong>Vreme:</strong> {{ selectedTimer.time }}</div>
        <div><strong>Status:</strong> {{ selectedTimer.status ? 'Uključen' : 'Isključen' }}</div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import {computed, onMounted,ref} from 'vue';
import ToggleSwitch from 'primevue/toggleswitch';
import store from '@/store';
import { useToast } from 'vue-toastification';
import Dialog from 'primevue/dialog';
const dialogVisible = ref(false);
const selectedTimer = ref(null);
const toast = useToast();

const timers = computed(() => {
  return store.getters['timer/getListOfTimer'];
});

const formatDevices = (arr) => {
  if (!arr || !arr.length) return 'Nema';
  return arr.map(x => x.name).join(', ');
};
const formatTime = (time) => {
  if (!time) return '';
  return time.split(':').slice(0, 2).join(':'); // Uklanja sekunde
};
onMounted(async () => {
  await getAllTimers();
})

const getAllTimers = async () => {
  try {
    await store.dispatch('timer/getAll');
    // timers.value = response.data.timers;
  }
  catch (error) {
    toast.error(error.message);
  }
}

const toggleStatus = async (timer, val) => {
  const updated = {
    ...timer,
    status: val ? 1 : 0,
    idsDevice: timer.devices.map(d => d.id),
    idsDays: timer.days.map(d => d.id)
  };
  console.log(updated);
  try {
    await store.dispatch("timer/changeTimer", updated);
    toast.success("Status promenjen");
  } catch (e) {
    toast.error(e.message);
  }
};
const openDialog = (timer) => {
  selectedTimer.value = timer;
  dialogVisible.value = true;
};
</script>

<style scoped>
.timer-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  gap:1rem;
  padding: 12px; /* ekvivalent Tailwind-ovom p-3 */
  border-bottom: 1px solid #e5e7eb; /* Tailwind border-gray-200 */
  transition: background-color 0.2s ease;
}
.timer-row:hover {
  background-color: #f9fafb; /* Tailwind hover:bg-gray-50 */
}
</style>
