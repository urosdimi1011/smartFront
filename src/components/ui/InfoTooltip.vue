<template>
  <div ref="wrapperRef" class="info-wrapper-container">
    <div class="info-wrapper" @click.stop="toggleTooltip">
      <slot name="icon">
        <div class="info-icon">
          <Icon icon="lucide:info" width="22" height="22" />
        </div>
      </slot>
    </div>
    
    <!-- Tooltip samo kada je show = true -->
    <Teleport to="body" v-if="show && hasSlot">
      <div 
        ref="tooltipRef" 
        class="tooltip" 
        v-bind="$attrs" 
        :style="computedTooltipStyle"
        @click.stop>
        <slot></slot>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { ref, defineProps, onMounted, onUnmounted, computed, useSlots, defineOptions, defineEmits, nextTick } from 'vue'

defineOptions({
  inheritAttrs: false
});

const slots = useSlots();
const show = ref(false);
const tooltipPosition = ref({});

const props = defineProps({
  text: String,
  showInfoIcon: {
    required: false,
    default: true
  },
  automaticOpen: {
    required: false,
    default: false
  },
  manualPosition: {
    type: Object,
    required: false,
    default: null
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  }
})

const hasSlot = computed(() => {
  return !!slots.default && slots.default().length > 0;
});

// Computed style za tooltip
const computedTooltipStyle = computed(() => {
  return { ...tooltipPosition.value };
});

const emit = defineEmits(['close']);
const wrapperRef = ref(null);
const tooltipRef = ref(null);

async function toggleTooltip() {
 if (props.disabled) {
    return;
  }
  show.value = !show.value;
  
  if (show.value) {
    // Sačekaj da se tooltip renderuje
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 10));
    
    updateTooltipPosition();
  }
}

const updateTooltipPosition = () => {
  if (props.manualPosition) {
    tooltipPosition.value = props.manualPosition;
    return;
  }
  
  if (!wrapperRef.value || !tooltipRef.value) return;
  
  // Pronađi anchor element
  let iconElement = wrapperRef.value.querySelector('.activeAll') ||
                    wrapperRef.value.querySelector('[data-tooltip-anchor]') ||
                    wrapperRef.value.querySelector('.btn-premium') ||
                    wrapperRef.value.querySelector('.info-icon') ||
                    wrapperRef.value.querySelector('svg');
  
  if (!iconElement) {
    const children = Array.from(wrapperRef.value.querySelectorAll('*'));
    iconElement = children.find(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  }
  
  if (!iconElement) {
    iconElement = wrapperRef.value;
  }

  const iconRect = iconElement.getBoundingClientRect();
  const isMobile = window.innerWidth < 768;
  const gap = 8;
  const padding = 10;
  
  console.log('=== TOOLTIP POSITIONING DEBUG ===');
  console.log('Window width:', window.innerWidth);
  console.log('Icon element:', iconElement.className || iconElement.tagName);
  console.log('Icon position:', {
    left: iconRect.left,
    right: iconRect.right,
    top: iconRect.top,
    bottom: iconRect.bottom,
    width: iconRect.width
  });
  
  // Prvo postavi sa visibility hidden da bi tooltip mogao da se renderuje
  let positionStyle = {
    position: 'fixed',
    top: Math.floor(iconRect.bottom + gap) + 'px',
    zIndex: 10000,
    maxWidth: isMobile ? '90vw' : '300px',
    transition: 'opacity 0.2s ease'
  };
  
  // Sačekaj sledeći frame da tooltip bude renderovan
  requestAnimationFrame(() => {
    if (!tooltipRef.value) return;
    
    const tooltipRect = tooltipRef.value.getBoundingClientRect();
    console.log('Tooltip dimensions:', {
      width: tooltipRect.width,
      height: tooltipRect.height
    });
    
    // LEVO-poravnaj tooltip sa buttonom
    let tooltipLeft = iconRect.left;
    
    console.log('Calculated tooltipLeft:', tooltipLeft);
    
    // Proveri da li izlazi van ekrana
    if (tooltipLeft < padding) {
      console.log('⚠️ Adjusting: tooltip goes off left edge');
      tooltipLeft = padding;
    } else if (tooltipLeft + tooltipRect.width > window.innerWidth - padding) {
      console.log('⚠️ Adjusting: tooltip goes off right edge');
      tooltipLeft = window.innerWidth - tooltipRect.width - padding;
    }
    
    positionStyle.left = Math.floor(tooltipLeft) + 'px';
    console.log('Final tooltip position:', positionStyle);
    console.log('================================');
    
    tooltipPosition.value = positionStyle;
  });
  
  // Postavi inicijalnu poziciju
  positionStyle.left = Math.floor(iconRect.left) + 'px';
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

// Zatvori tooltip kada korisnik skroluje
const handleScroll = () => {
  if (show.value) {
    show.value = false;
    emit('close', show.value);
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  // Zatvori tooltip na scroll umesto da ga pozicioniraš
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
.info-wrapper-container {
  display: inline-flex;
}

.info-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.info-icon {
  display: flex;
  align-items: center;
  color: blue !important;
  transition: color 0.2s;
}
.info-icon :deep(circle) {
  color:#15aff8;
  fill: #15aff8;
}
.info-icon:hover {
  color: #15aff8;
}

.tooltip {
  background-color: #222;
  color: blue;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  text-align: left;
  z-index: 10000;
  max-width: 300px;
  width: max-content;
  pointer-events: auto;
}

.tooltip :deep(ul) {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.tooltip :deep(li) {
  margin: 4px 0;
}

.tooltip :deep(p) {
  margin: 0;
  white-space: normal;
}

@media (max-width: 768px) {
  .tooltip {
    font-size: 12px;
    padding: 6px 10px;
    max-width: 85vw;
  }
}

@media (max-width: 480px) {
  .tooltip {
    font-size: 11px;
    padding: 5px 8px;
    max-width: 90vw;
  }
}
</style>