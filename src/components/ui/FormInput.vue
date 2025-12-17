<template>
  <div class="form-group" :class="[
    {
      'has-error': hasError,
      'is-focused': isFocused
    },
    mode === 'dark' ? 'white-text' : ''
  ]">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>

    <div
      v-if="type === 'text' || type === 'password' || type === 'email' || type === 'hidden' || type === 'number' || type === 'hidden'"
      class="input-wrapper">
      <Field :placeholder="placeholder" :type="type" :id="id" :name="name" :value="modelValue" @input="handleInput"
        @focus="isFocused = true" @blur="isFocused = false" class="form-input" v-bind="$attrs" />
      <div class="input-border"></div>
    </div>

    <div v-if="multiSelect && type === 'groupCheckBox'" class="select-wrapper">
      <MultiSelect :focus-on-hover="false" filter  v-model="selected" :options="options" option-value="value" option-label="label"
        :placeholder="label || 'Izaberite opcije'" class="form-multiselect">
  
      </MultiSelect>
    </div>

    <div v-if="type === 'checkbox' && options && options.length" class="checkbox-group">
      <div v-for="option of options" :key="option.id" class="checkbox-item">
        <Field :name="name" type="checkbox" :value="option.id" v-slot="{ field, meta }">
          <div class="custom-checkbox">
            <Checkbox v-bind="field" :name="name" :inputId="`${option.name.split(' ').join('_')}${option.id}`"
              :value="option.id" @change="$emit('update:modelValue', meta.value)" v-model="proba"
              class="checkbox-input" />
            <label :for="`${option.name.split(' ').join('_')}${option.id}`" class="checkbox-label">
              {{ option.name }}
              <template v-if="icon">
                <Icon  :icon="getCategoryIcon(option.category.name)" class="checkbox-icon" />
              </template>
            </label>
          </div>
        </Field>
      </div>
    </div>

    <div v-if="type === 'checkbox' && !options" class="single-checkbox">
      <Field :name="name" type="checkbox" v-slot="{ field }">
        <div class="custom-checkbox">
          <Checkbox v-model="proba" v-bind="field" :inputId="id" :name="name"
            :value="(componentOptions && componentOptions.isBinary) ? undefined : id"
            :binary="componentOptions && componentOptions.isBinary" class="checkbox-input" />
          <label v-if="label" :for="id" class="checkbox-label">{{ label }}</label>
        </div>
      </Field>
    </div>

    <div v-if="type === 'radio' && options && options.length" class="radio-group">
      <div v-for="option of options" :key="option.id" class="radio-item">
        <Field :name="name" type="radio" :value="option.id" v-slot="{ field, meta }">
          <div class="custom-radio">
            <RadioButton v-bind="field" :inputId="`${option.name.split(' ').join('_')}${option.id}`" :name="name"
              :value="option.id" @change="$emit('update:modelValue', meta.value)" v-model="proba" class="radio-input" />
            <label :for="`${option.name.split(' ').join('_')}${option.id}`" class="radio-label">
              {{ option.name }}
            </label>
          </div>
        </Field>
      </div>
    </div>

    <ErrorMessage :name="name" class="error-message" />
  </div>
</template>

<script setup>
import { defineProps, defineEmits, onUpdated, computed, defineOptions, ref } from 'vue';
import { Field, ErrorMessage } from 'vee-validate';
import { Checkbox, MultiSelect, RadioButton } from 'primevue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    required: false
  },
  modelValue: {
    type: [String, Array, Number],
    required: false,
  },
  multiSelect: {
    type: Boolean,
    required: false,
    default: false
  },
  options: {
    type: Array,
    required: false
  },
  componentOptions: {
    type: Object,
    required: false
  },
  mode: {
    type: String,
    required: false,
    default: "white"
  },
  icon: {
    type: Boolean,
    required: false,
    default: false
  }
});

defineOptions({
  inheritAttrs: false
});

const emit = defineEmits(['update:modelValue']);

// State
const isFocused = ref(false);
const hasError = ref(false);

// Computed
const proba = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    emit('update:modelValue', newValue);
  }
});

const selected = computed({
  get: () => props.modelValue,
  set: (newValue) => emit('update:modelValue', newValue)
});

const allSelected = computed(() => {
  if (!props.options || !selected.value) return false;
  return props.options.length > 0 && selected.value.length === props.options.length;
});

function toggleSelectAll(e) {
  if (!props.options) return;
  if (e.target.checked) {
    selected.value = props.options.map(o => o.value);
  } else {
    selected.value = [];
  }
}

// Methods
const handleInput = (event) => {
  emit('update:modelValue', event.target.value);
};

onUpdated(() => {
  if (props.multiSelect) {
    emit('update:modelValue', selected.value);
  }
});

const categoryIcons = {
  'Cooling': 'mdi:snowflake',
  'Heating': 'mdi:fire',
  'Plug': 'mdi:power-plug',
  'Light': 'mdi:lightbulb',
  'Temperature': 'mdi:thermometer',
  'Switch': 'mdi:toggle-switch',
};
function getCategoryIcon(categoryName) {
  return categoryIcons[categoryName] || 'mdi:help-circle'; // Default ikona
}
</script>

<style scoped>


.white-text input,
.white-text label {
  color: white !important;
}

/* Base form group */
.form-group {
  position: relative;
  margin: 24px 0;
  transition: all 0.3s ease;
  flex-wrap: wrap;

}

.form-group .error-message {
  width: 100%;
}

/* Labels */
.form-label {
 color: rgba(255, 255, 255, 0.9);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding-left: 0.25rem;
  margin-bottom: 0.5rem;
}


.form-label::before {
  content: '';
  width: 2px;
  height: 20px;
  background: linear-gradient(135deg, #4985e6 0%, #357abd 100%);
  border-radius: 2px;
}

.is-focused .form-label {
  color: #3b82f6;
}

.has-error .form-label {
  color: #dc2626;
}

/* Input wrapper with modern floating border */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.groupCheckBox {
  background-color: #1f2937 !important;

}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 16px;
  font-weight: 400;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);  
  border: 2px solid #cbd5e1 !important;
  border-radius: 8px !important;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0.025em;
  box-shadow: 
    inset 0 2px 4px 0 rgba(0, 0, 0, 0.1),
    0 4px 12px 0 rgba(0, 0, 0, 0.1);
  }

.form-input::placeholder {
  color: white !important;
  font-weight: 400;
}

.form-input:focus {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 
    inset 0 2px 4px 0 rgba(0, 0, 0, 0.05),
    0 8px 20px 0 rgba(0, 0, 0, 0.2),
    0 0 0 3px rgba(255, 255, 255, 0.1);
}

.form-input:hover:not(:focus) {
   background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.has-error .form-input {
  border-color: #dc2626;
  background: #fef2f2;
}
.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.has-error .form-input:focus {
 box-shadow: 
    inset 0 2px 4px 0 rgba(0, 0, 0, 0.05),
    0 8px 20px 0 rgba(244, 67, 54, 0.3),
    0 0 0 3px rgba(244, 67, 54, 0.15);
}

/* Animated border effect */
.input-border {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: all 0.3s ease;
  transform: translateX(-50%);
  border-radius: 1px;
}

.is-focused .input-border {
  width: 100%;
}

/* MultiSelect styling */
.select-wrapper {
  position: relative;
  width: 100%;
}

.form-multiselect {
  width: 100%;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.form-multiselect:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Checkbox styling */
.checkbox-group,
.single-checkbox {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.checkbox-item,
.single-checkbox {
  display: flex;
  align-items: flex-start;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.custom-checkbox:hover {
  background: rgba(59, 130, 246, 0.05);
}
:deep(.p-checkbox) {
  width: 22px;
  height: 22px;
  margin-right: 12px;
  flex-shrink: 0;
}

/* Box (kockica) */
:deep(.p-checkbox .p-checkbox-box) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  width: 22px;
  height: 22px;
  backdrop-filter: blur(5px);
  transition: all 0.2s ease;
}

/* Hover efekat */
:deep(.p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box:hover) {
  border-color: rgba(255, 255, 255, 0.3) !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

/* Checked state - GLASSA EFEFKAT */
:deep(.p-checkbox .p-checkbox-box.p-highlight) {
  background: linear-gradient(
    135deg,
    rgba(0, 100, 180, 0.8),
    rgba(0, 150, 230, 0.6)
  ) !important;
  border-color: rgba(100, 200, 255, 0.5) !important;
  box-shadow: 
    0 0 15px rgba(0, 150, 255, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
}

/* Check ikonica (kvačica) */
:deep(.p-checkbox .p-checkbox-box .p-checkbox-icon) {
  color: white !important;
  font-weight: bold;
  font-size: 14px;
}

/* Focus (accessibility) */
:deep(.p-checkbox .p-checkbox-box.p-focus) {
  box-shadow: 0 0 0 2px rgba(0, 150, 255, 0.2) !important;
}
.checkbox-input {
  margin: 0;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 5px;
  font-size: 18px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  user-select: none;
  line-height: 1.5;
  margin: 0;
}

/* Radio button styling */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-item {
  display: flex;
  align-items: flex-start;
}

.custom-radio {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: #ffffff;
  width: 100%;
}

.custom-radio:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.02);
}

.radio-input:checked+.custom-radio {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.radio-label {
  font-size: 15px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  user-select: none;
  line-height: 1.5;
  margin: 0;
  flex: 1;
}

/* Error message styling */
.error-message {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #dc2626;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

  .form-label {
    color: #e5e7eb;
  }

  .error-message {
    color: #dc2626 !important;
  }

  .is-focused .form-label {
    color: #60a5fa;
  }

  .form-multiselect {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);  
    color: #ffffff !important;
  }

  /* Dropdown panel */
  .form-multiselect :deep(.p-multiselect-panel) {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);  
    color: #ffffff !important;
  }

.form-multiselect :deep(.p-focus) {
    background: transparent !important;
    color: #ffffff !important;
}

/* Override PrimeVue CSS varijable za p-focus stanje */


  /* Options in dropdown */
  .form-multiselect .p-multiselect-item {
    background-color: #2d2d30 !important;
    color: #ffffff !important;
  }

  /* Hover state for options */
  .form-multiselect .p-multiselect-item:hover {
    background-color: #3e3e42 !important;
    color: #ffffff !important;
  }

  /* Selected options */
  .form-multiselect .p-multiselect-item.p-highlight {
    background-color: #ff9500 !important;
    color: #ffffff !important;
  }

  /* Selected options hover */
  .form-multiselect .p-multiselect-item.p-highlight:hover {
    background-color: #ffb347 !important;
  }

  .form-multiselect :deep(.p-multiselect-label.p-placeholder) {
    color: white !important;
  }
.form-multiselect :deep(.p-multiselect-label) {
    color: #ffffff !important;
  }
  /* Selected chips/tokens */
  .form-multiselect .p-multiselect-token {
    background-color: #ff9500 !important;
    color: #ffffff !important;
    border: 1px solid #ff9500 !important;
  }

  /* Close icon on chips */
  .form-multiselect .p-multiselect-token-icon {
    color: #ffffff !important;
  }

  /* Dropdown arrow/trigger */
  .form-multiselect .p-multiselect-trigger {
    color: #ffffff !important;
  }

  /* Filter input if enabled */
  .form-multiselect .p-multiselect-filter {
    background-color: #2d2d30 !important;
    border-color: #3e3e42 !important;
    color: #ffffff !important;
  }

  /* Filter input placeholder */
  .form-multiselect .p-multiselect-filter::placeholder {
    color: #999999 !important;
  }

  /* Checkbox styling */
  .form-multiselect .p-checkbox .p-checkbox-box {
    background-color: #2d2d30 !important;
    border-color: #3e3e42 !important;
  }

  /* Checked checkbox */
  .form-multiselect .p-checkbox .p-checkbox-box.p-highlight {
    background-color: #ff9500 !important;
    border-color: #ff9500 !important;
  }

  /* Checkbox checkmark */
  .form-multiselect .p-checkbox .p-checkbox-box .p-checkbox-icon {
    color: #ffffff !important;
  }

  /* .form-input {
    background: #1f2937 !important;
    border-color: #374151 !important;
    color: #f9fafb !important;
  } */



  .form-input::placeholder {
    color: #6b7280;
  }

  .form-input:focus {
    background: #111827;
    border-color: #60a5fa;
  }

  .custom-radio,
  .custom-checkbox {
    background: transparent !important;
    border-color: #374151 !important;
  }

  .custom-radio:hover,
  .custom-checkbox:hover {
    background: #111827;
    border-color: #60a5fa;
  }

  .checkbox-label,
  .radio-label {
    color: #e5e7eb;
  }
/* Legacy compatibility classes */
/* .form-input.form-input {
  background-color: transparent;
  color: white;
  border: none;
  border-bottom: 2px solid white;
} */

.moj-tajmer-input .form-input {
  border: 1px solid rgba(0, 0, 0, 0.25) !important;
  padding: 8px 10px;
  border-radius: 8px !important;
  background: white;
  color: #1f2937;
}

.moj-tajmer-input .form-input::placeholder {
  color: rgba(0, 0, 0, 0.6);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .form-input {
    padding: 7px 16px !important;
    font-size: 16px !important;
    /* Prevent zoom on iOS */
  }

  .form-group {
    margin: 20px 0 !important;
  }

  .custom-radio,
  .custom-checkbox {
    padding: 10px 12px !important;
  }
}

/* Accessibility improvements */
/* .form-input:focus-visible {
  outline: 2px solid #3b82f6 !important;
  outline-offset: 2px !important;
}

.custom-checkbox:focus-within,
.custom-radio:focus-within {
  outline: 2px solid #3b82f6 !important;
  outline-offset: 2px !important;
} */

/* High contrast mode */
@media (prefers-contrast: high) {
  .form-input {
    border-width: 3px;
  }

  .form-input:focus {
    box-shadow: none;
    border-color: #000;
  }
}
</style>