<template>
  <div class="energy-report-container">
    <div class="report-header">
      <h3>Izveštaj po danima</h3>
    </div>

    <div class="report-filters">
      <button 
        @click="setViewMode('week')" 
        :class="{ active: viewMode === 'week' }"
        class="filter-btn"
      >
        7 dana
      </button>
      <button 
        @click="setViewMode('month')" 
        :class="{ active: viewMode === 'month' }"
        class="filter-btn"
      >
        30 dana
      </button>
    </div>

    <div class="report-content">
      <div v-if="!dailyData || dailyData.length === 0" class="no-data">
        <p>Nema dostupnih podataka</p>
      </div>

      <div v-else class="daily-list">
        <div v-for="(day, index) in dailyData" :key="index" class="daily-item">
          <div class="day-header">
            <span class="day-date">{{ formatDate(day.date) }}</span>
            <span class="day-consumption">{{ day.kwh }} kWh</span>
          </div>
          
          <div class="day-stats">
            <div class="stat-row">
              <span class="stat-label">Sesije:</span>
              <span class="stat-value">{{ day.sessions }}</span>
            </div>
            
            <div class="stat-row">
              <span class="stat-label">Vreme:</span>
              <span class="stat-value">{{ day.duration }}</span>
            </div>

            <div class="stat-row">
              <span class="stat-label">Snaga:</span>
              <span class="stat-value">{{ day.power }} W</span>
            </div>
          </div>

          <div class="consumption-bar">
            <div 
              class="consumption-fill" 
              :style="{ width: getConsumptionPercentage(day.kwh) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="report-summary">
      <div class="summary-card">
        <span class="summary-label">Ukupna potrošnja</span>
        <span class="summary-value">{{ totalConsumption }} kWh</span>
      </div>

      <div class="summary-card">
        <span class="summary-label">Prosečna dnevna</span>
        <span class="summary-value">{{ averageConsumption }} kWh</span>
      </div>

      <div class="summary-card">
        <span class="summary-label">Maksimalna</span>
        <span class="summary-value">{{ maxConsumption }} kWh</span>
      </div>
    </div>

    <button-my @click="$emit('close')" variant="glass" class="close-btn">
      <template #icon>
        <Icon icon="material-symbols-light:close" width="22" height="22" />
      </template>
      Zatvori
    </button-my>
  </div>
</template>

<script setup>
import { ref, defineProps, computed, defineEmits } from 'vue';
import ButtonMy from './ButtonMy.vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  todayStats: {
    type: Object,
    default: null
  },
  monthStats: {
    type: Object,
    default: null
  },
  energyStats: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);

const viewMode = ref('week');

const setViewMode = (mode) => {
  viewMode.value = mode;
};

// Mock data - možete zameniti sa pravim API podacima
const mockDailyData = [
  { date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000), kwh: 2.5, sessions: 12, duration: '14:30', power: 850 },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), kwh: 1.8, sessions: 8, duration: '10:15', power: 720 },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), kwh: 3.2, sessions: 15, duration: '18:45', power: 950 },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), kwh: 2.1, sessions: 10, duration: '12:30', power: 810 },
  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), kwh: 1.5, sessions: 7, duration: '08:20', power: 650 },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), kwh: 2.8, sessions: 13, duration: '16:10', power: 900 },
  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), kwh: 2.2, sessions: 11, duration: '13:00', power: 780 }
];

const dailyData = computed(() => {
  if (viewMode.value === 'week') {
    return mockDailyData;
  } else {
    // Za mesec, možete vratiti više dana
    return mockDailyData;
  }
});

const formatDate = (date) => {
  const options = { weekday: 'short', month: 'numeric', day: 'numeric' };
  return new Intl.DateTimeFormat('sr-RS', options).format(date);
};

const totalConsumption = computed(() => {
  if (!dailyData.value) return '0';
  const total = dailyData.value.reduce((sum, day) => sum + parseFloat(day.kwh), 0);
  return total.toFixed(2);
});

const averageConsumption = computed(() => {
  if (!dailyData.value || dailyData.value.length === 0) return '0';
  const total = parseFloat(totalConsumption.value);
  return (total / dailyData.value.length).toFixed(2);
});

const maxConsumption = computed(() => {
  if (!dailyData.value) return '0';
  const max = Math.max(...dailyData.value.map(day => parseFloat(day.kwh)));
  return max.toFixed(2);
});

const getConsumptionPercentage = (kwh) => {
  const max = parseFloat(maxConsumption.value);
  if (max === 0) return 0;
  return (kwh / max) * 100;
};
</script>

<style scoped>
.energy-report-container {
  width: 100%;
  padding: 1.5rem;
  color: #fff;
}

.report-header {
  margin-bottom: 1.5rem;
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.report-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
}

.report-filters {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.filter-btn.active {
  background: #4caf50;
  border-color: #4caf50;
  color: #fff;
}

.report-content {
  margin-bottom: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.5);
}

.daily-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.daily-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.daily-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.day-date {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  text-transform: capitalize;
}

.day-consumption {
  font-size: 1.1rem;
  font-weight: 700;
  color: #22c55e;
}

.day-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.stat-value {
  color: #15aff8;
  font-weight: 600;
  margin-left: 0.5rem;
}

.consumption-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.consumption-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #15aff8);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.report-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.summary-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.summary-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #4caf50;
}

.close-btn {
  width: 100%;
}

@media (max-width: 768px) {
  .energy-report-container {
    padding: 1rem;
  }

  .day-stats {
    grid-template-columns: 1fr;
  }

  .report-summary {
    grid-template-columns: 1fr;
  }

  .report-filters {
    flex-direction: column;
  }

  .filter-btn {
    width: 100%;
  }
}
</style>
