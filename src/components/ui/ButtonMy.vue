<template>
  <button 
    :class="[
      'btn-premium',
      computedVariant,
      computedSize,
      { 
        'btn-loading': loading,
        'btn-disabled': disabled,
        'btn-icon-only': isIconOnly,
        'btn-block': block
      }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
    v-bind="$attrs"
  >
    <div v-if="loading" class="btn-spinner">
      <svg class="spinner-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
      </svg>
    </div>
    
    <span v-if="$slots.icon && !loading" class="btn-icon">
      <slot name="icon"></slot>
    </span>
    
    <span v-if="$slots.default && (!isIconOnly || loading)" class="btn-content">
      <slot></slot>
    </span>
    
    <span v-if="text && !$slots.default" class="btn-content">
      {{ text }}
    </span>
    
    <span class="btn-ripple" ref="rippleRef"></span>
  </button>
</template>

<script setup>
import { ref, computed, useSlots, defineProps, defineEmits } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'ghost', 'glass'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'xl'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);
const slots = useSlots();
const rippleRef = ref(null);

// Computed properties
const computedVariant = computed(() => {
  // Ako komponenta ima određene klase, mapuj ih na varijante
  const classList = (props.class || '').toString();
  if (classList.includes('color-button')) return 'success';
  if (classList.includes('form-button')) return 'primary';
  if (classList.includes('activeAll')) return 'ghost';
  if (classList.includes('remove-group')) return 'danger';
  return props.variant;
});

const computedSize = computed(() => {
  // Auto-detect veličinu na osnovu postojećih klasa ili stilova
  const classList = (props.class || '').toString();
  if (classList.includes('small')) return 'small';
  if (classList.includes('large')) return 'large';
  return props.size;
});

const isIconOnly = computed(() => {
  return !props.loading && 
         !props.text && 
         (!slots.default || slots.default().length === 0) && 
         slots.icon;
});

// Methods - zadržava postojeću funkcionalnost
const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    createRipple(event);
    emit('click', event);
  }
};

const createRipple = (event) => {
  if (!rippleRef.value) return;
  
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  
  rippleRef.value.appendChild(ripple);
  
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.remove();
    }
  }, 600);
};
</script>

<style scoped>
.btn-premium {
  position: relative;
  width: 55%; 
  font-weight: 600; 
  border: 0; 
  color: #fff; 
  border-radius: 0.8em; 
  font-size: 1rem;
  cursor: pointer; 
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  text-decoration: none;
  outline: none;
  overflow: hidden;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  letter-spacing: 0.025em;
  line-height: 1.2;
  min-height: 44px;
  touch-action: manipulation;
  backdrop-filter: blur(8px);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.15),
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.primary {
  background: linear-gradient(135deg, #4985e6 0%, #357abd 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #3d76d9 0%, #2e6ba4 100%);
  box-shadow: 
    0 4px 20px rgba(73, 133, 230, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.secondary {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
}

.secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6268 0%, #3d424a 100%);
  transform: translateY(-1px);
}

.success {
  background: linear-gradient(135deg, #87c33e 0%, #6ba32a 100%); /* Vaš color-button */
  color: white;
}

.success:hover:not(:disabled) {
  background: linear-gradient(135deg, #7bb235 0%, #5e8f24 100%);
  box-shadow: 0 4px 20px rgba(135, 195, 62, 0.4);
  transform: translateY(-1px);
}

.danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  box-shadow: 0 4px 20px rgba(220, 53, 69, 0.4);
  transform: translateY(-1px);
}

.ghost {
  background: rgba(255, 255, 255, 0.1);
  color: currentColor;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
  
  padding: 0.75rem 1.5rem;
  display: inline-flex;
  align-items: center;
  /* gap: 0.5rem; */
  
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.glass:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.45);
}

.glass:active::before:active {
  transform: translateY(0);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.3);
}

.glass::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.glass:active::before {
  width: 300px;
  height: 300px;
}

/* Disabled state */
.glass:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
/* Size variants - zadržavaju originalnu logiku */
.small {
  width: 45%;
  font-size: 0.85rem;
  /* padding: 0.3em 1em; */
  min-height: 36px;
}

.medium {
  width: 55%; /* Original */
  font-size: 1rem; /* Original */
  /* padding: 0.5em 1.2em; */
  min-height: 44px;
}

.large {
  width: 65%;
  font-size: 1.1rem;
  /* padding: 0.6em 1.4em; */
  min-height: 52px;
}

.xl {
  width: 75%;
  font-size: 1.2rem;
  /* padding: 0.7em 1.6em; */
  min-height: 60px;
  font-weight: 700;
}

/* Block variant */
.btn-block {
  width: 100% !important;
}

/* States */
.btn-loading {
  pointer-events: none;
}

.btn-disabled,
.btn-premium:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-icon-only {
  width: auto !important;
  min-width: 44px;
  padding: 0.5em;
}

/* Content wrappers */
.btn-content {
  position: relative;
  z-index: 2;
}

.btn-icon {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

/* Loading spinner */
.btn-spinner {
  position: relative;
  z-index: 3;
}

.spinner-icon {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.spinner-icon circle {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
  animation: dash 1.5s ease-in-out infinite;
}

/* Ripple effect */
.btn-ripple {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

:deep(.ripple-effect) {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  pointer-events: none;
  transform: scale(0);
  animation: ripple 0.6s linear;
}

/* Legacy class support - mapiranje postojećih klasa */
.btn-premium:global(.color-button) {
  /* Automatski primeni success varijant */
}

.btn-premium:global(.form-button) {
  /* Zadržaj existing behavior */
  width: 80%;
}

.btn-premium:global(.activeAll) {
  /* Postojeći stil za activeAll */
  width: 3vw;
  height: 5vh;
  /* padding: 10px; */
  border: 1px solid #fff;
}

/* Animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 50;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 25, 50;
    stroke-dashoffset: -10;
  }
  100% {
    stroke-dasharray: 25, 50;
    stroke-dashoffset: -35;
  }
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Active state */
.btn-premium:active:not(:disabled) {
  transform: translateY(1px) scale(0.98);
}

/* Focus styles */
.btn-premium:focus-visible {
  outline: 2px solid rgba(73, 133, 230, 0.5);
  outline-offset: 2px;
}

/* Mobile responsive - zadržano iz originala */
@media (max-width: 768px) {
  .btn-premium {
    min-height: 48px;
    touch-action: manipulation;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .btn-premium {
    transition: none;
  }
  
  .btn-premium:hover:not(:disabled) {
    transform: none;
  }
}
@media (max-width: 480px) {
  .btn-premium {
    margin-top: 0.3rem;
  }
}
</style>