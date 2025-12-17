<template>
  <div ref="wrapperRef" class="energy-consumption-wrapper">
    <div class="consumption-icon" @click.stop="toggleConsumption" v-if="hasConsumption">
      <Icon icon="hugeicons:energy" width="22" height="22" class="custom-icon-color-for-energy" />
    </div>
    <Teleport to="body" v-if="show && hasConsumption">
      <div ref="tooltipRef" class="consumption-tooltip" v-bind="$attrs" :style="tooltipPosition" @click.stop>
        <div class="consumption-header">
          <p>Potrošnja energije</p>
        </div>

        <div class="consumption-section today-section">
          <div class="section-title">
            <span class="indicator today"></span>
            <span>DANAS</span>
          </div>

          <div class="consumption-content">
            <div class="consumption-item">
              <span class="label">Snaga:</span>
              <span class="value">{{ powerConsumption }} W</span>
            </div>

            <div class="consumption-item">
              <span class="label">Potrošeno:</span>
              <span class="value highlight">{{ todayKwh }} kWh</span>
            </div>

            <div class="consumption-item">
              <span class="label">Sesija:</span>
              <span class="value">{{ todaySessions }}</span>
            </div>

            <div class="consumption-item">
              <span class="label">Vreme:</span>
              <span class="value">{{ todayDuration }}</span>
            </div>

            <div v-if="isRunning" class="current-session">
              <div class="running-indicator">
                <span class="pulse"></span>
                <span class="label">Trenutno radi:</span>
              </div>
              <span class="value">{{ currentSessionTime }}</span>
            </div>
          </div>
        </div>

        <div class="consumption-section summary-section">
          <div class="section-title">
            <span class="indicator summary"></span>
            <span>UKUPNO</span>
          </div>

          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">Mesec:</span>
              <span class="value">{{ monthKwh }} kWh</span>
              <span class="sessions">{{ monthSessions }} ses</span>
            </div>

            <div class="summary-item">
              <span class="label">Sve:</span>
              <span class="value">{{ totalKwh }} kWh</span>
              <span class="sessions">{{ totalSessions }} ses</span>
            </div>
          </div>
        </div>
        <ButtonMy @click="handleOpenDetailModal" variant="glass" class="w-100">
          Detaljniji izveštaj
          <template #icon>
            <Icon icon="streamline-plump:content-statistic" width="22" height="22" />
          </template>
        </ButtonMy>
      </div>
    </Teleport>

    <Teleport to="body">
      <modal-layout v-if="isOpen" :visible="isOpen" title="Detaljniji izveštaj energije" :modal-content="modalContent"
        @close="closeModal">
        <template #body>
          <component :is="modalContent" :today-stats="todayStats" :month-stats="monthStats" :energy-stats="energyStats"
            @close="closeModal" />
        </template>
      </modal-layout>
    </Teleport>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { ref, defineProps, onMounted, onUnmounted, computed, defineOptions, defineEmits, watch, nextTick, defineAsyncComponent, markRaw } from 'vue'
import ButtonMy from './ButtonMy.vue';
import { showModal } from '../../composables/modal';
const ModalLayout = defineAsyncComponent(() =>
  import('../modalLayout.vue')
);

defineOptions({
  inheritAttrs: false
});

const show = ref(false);
const tooltipPosition = ref({});
const { isOpen, show: openModal, close: closeModal, confirm, modalContent } = showModal();

const props = defineProps({
  todayStats: {
    type: Object,
    required: false,
    default: null
  },
  monthStats: {
    type: Object,
    required: false,
    default: null
  },
  energyStats: {
    type: Object,
    required: false,
    default: null
  },
  hasConsumption: {
    type: Boolean,
    required: false,
    default: false
  }
})

const emit = defineEmits(['close']);
const wrapperRef = ref(null);
const tooltipRef = ref(null);

// DANAS
const powerConsumption = computed(() => {
  return props.energyStats?.power_consumption_w || 0;
});

const todayKwh = computed(() => {
  return props.todayStats?.total_kwh || 0;
});

const todaySessions = computed(() => {
  return props.todayStats?.total_sessions || 0;
});

const todayDuration = computed(() => {
  return props.todayStats?.total_duration_formatted || '00:00:00';
});

const isRunning = computed(() => {
  return props.todayStats?.is_running || false;
});

const currentSessionTime = computed(() => {
  if (!isRunning.value) return '00:00:00';

  const seconds = props.todayStats?.current_session_seconds || 0;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
});

// MESEC
const monthKwh = computed(() => {
  return props.monthStats?.total_kwh || 0;
});

const monthSessions = computed(() => {
  return props.monthStats?.total_sessions || 0;
});

// UKUPNO (all-time)
const totalKwh = computed(() => {
  return props.energyStats?.total_kwh || 0;
});

const totalSessions = computed(() => {
  return props.energyStats?.total_sessions || 0;
});

async function toggleConsumption() {
  show.value = !show.value;

  if (show.value) {
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 10));
    updateTooltipPosition();
  }
}

const updateTooltipPosition = () => {
  if (!wrapperRef.value || !tooltipRef.value) return;

  const iconRect = wrapperRef.value.getBoundingClientRect();
  const tooltipRect = tooltipRef.value.getBoundingClientRect();
  const isMobile = window.innerWidth < 768;
  const gap = 10;
  const padding = 10;

  let positionStyle = {
    position: 'fixed',
    top: Math.floor(iconRect.bottom + gap) + 'px',
    zIndex: 10000,
    maxWidth: isMobile ? '90vw' : '320px'
  };

  let tooltipLeft = iconRect.left;
  let tooltipBottom = iconRect.bottom;

  if (tooltipLeft < padding) {
    tooltipLeft = padding;
  } else if (tooltipLeft + tooltipRect.width > window.innerWidth - padding) {
    tooltipLeft = window.innerWidth - tooltipRect.width - padding;
  }


  if (tooltipBottom + tooltipRect.height > window.innerHeight - padding) {
    positionStyle.top = Math.floor(iconRect.top - tooltipRect.height - gap) + 'px';
  }

  positionStyle.left = Math.floor(tooltipLeft) + 'px';
  tooltipPosition.value = positionStyle;
};

const handleClickOutside = (event) => {
  if (wrapperRef.value &&
    !wrapperRef.value.contains(event.target) &&
    (!tooltipRef.value || !tooltipRef.value.contains(event.target))) {
    show.value = false;
    emit('close', show.value);
  }
};

const handleScroll = () => {
  if (show.value) {
    show.value = false;
    emit('close', show.value);
  }
};

watch(show, (newVal) => {
  if (newVal) {
    setTimeout(updateTooltipPosition, 0);
  }
});
const EnergyReportComponent = markRaw(
  defineAsyncComponent(() =>
    import('./EnergyReport.vue')
  )
);

const handleOpenDetailModal = () => {
  show.value = false;
  openModal(EnergyReportComponent, null, {
    title: "Detaljniji izveštaj energije",
    todayStats: props.todayStats,
    monthStats: props.monthStats,
    energyStats: props.energyStats
  });
};
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', handleScroll, true);
  window.addEventListener('resize', handleScroll);
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', handleScroll, true);
  window.removeEventListener('resize', handleScroll);
})
</script>

<style scoped>
.w-100 {
  width: 100%;
}

.custom-icon-color-for-energy :deep(path) {
  fill: rgb(163, 163, 21) !important;
  color: yellow !important;
}

.energy-consumption-wrapper {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.consumption-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 50%;
  transition: all 300ms;
}

.consumption-icon:hover {
  background-color: rgba(21, 175, 248, 0.1);
}

.consumption-icon :deep(svg) {
  color: #15aff8 !important;
}

.consumption-tooltip {
  background-color: #222;
  color: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 240px;
  max-width: 320px;
  width: max-content;
}

.consumption-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 8px;
  margin-bottom: 12px;
  text-align: center;
  color: white !important;
}

.consumption-header p {
  margin: 0;
  font-weight: 600;
  /* color: #15aff8; */
  font-size: 14px;
}

.consumption-section {
  margin-bottom: 12px;
}

.consumption-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.indicator.today {
  background-color: #22c55e;
}

.indicator.summary {
  background-color: #15aff8;
}

.today-section {
  background: rgba(34, 197, 94, 0.05);
  padding: 10px;
  border-radius: 6px;
  border-left: 3px solid #22c55e;
}

.summary-section {
  background: rgba(21, 175, 248, 0.05);
  padding: 10px;
  border-radius: 6px;
  border-left: 3px solid #15aff8;
}

.consumption-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.consumption-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
}

.consumption-item .label {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  font-size: 12px;
}

.consumption-item .value {
  /* color: #15aff8; */
  font-weight: 600;
  margin-left: 8px;
  font-size: 13px;
}

.consumption-item .value.highlight {
  color: #22c55e;
  font-size: 15px;
}

.current-session {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.running-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.pulse {
  width: 6px;
  height: 6px;
  background-color: #22c55e;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0);
  }
}

.summary-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
}

.summary-item .label {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  font-size: 11px;
  min-width: 45px;
}

.summary-item .value {
  color: #15aff8;
  font-weight: 600;
  font-size: 12px;
  flex: 1;
  text-align: right;
  margin-right: 8px;
}

.summary-item .sessions {
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  font-weight: 500;
  min-width: 40px;
  text-align: right;
}

@media (max-width: 768px) {
  .consumption-tooltip {
    font-size: 12px;
    padding: 10px 12px;
    min-width: 200px;
  }

  .consumption-item .label,
  .summary-item .label {
    font-size: 11px;
  }

  .consumption-item .value {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .consumption-tooltip {
    font-size: 11px;
    padding: 8px 10px;
    min-width: 180px;
  }

  .consumption-header p {
    font-size: 12px;
  }
}
</style>