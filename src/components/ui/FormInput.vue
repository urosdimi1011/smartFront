  <template>
      <div class="form-group">
          <label v-if="label" :for="id">{{ label }}</label>
          <Field v-if="type === 'text' || type === 'password' || type === 'email' || type==='hidden'" :placeholder="placeholder" :type="type" :id="id" :name="name"
              :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
          <MultiSelect v-if="multiSelect && type === 'groupCheckBox'" v-model="selected" :options="options"
              option-value="value" option-label="label" :placeholder="label" class="w-full md:w-20rem" />
          <div v-if="type === 'checkbox' && options && options.length" class="w">
              <div v-for="option of options" :key="option.id">
                  <label :for="`${option.name.split(' ').join('_')}${option.id}`">{{ option.name }}</label>
                  <Field checked="true" :name="name" type="checkbox" :value="option.id" v-slot="{ field, meta }">
                      <Checkbox v-bind="field" :name="name" :inputId="`${option.name.split(' ').join('_')}${option.id}`"
                          :value="option.id" @change="$emit('update:modelValue', meta.value)" v-model="proba" />
                  </Field>
              </div>
          </div>
        <div v-if="type === 'checkbox' && !options">
          <Field
              :name="name"
              type="checkbox"
              v-slot="{ field }"
          >
            <Checkbox
                v-model="proba"
                v-bind="field"
                :inputId="id"
                :name="name"
                binary
            />
          </Field>
        </div>
          <div v-if="type === 'radio' && options && options.length" class="w">
              <div v-for="option of options" :key="option.id">
                  <label :for="`${option.name.split(' ').join('_')}${option.id}`">{{ option.name }}</label>
                  <Field :name="name" type="radio" :value="option.id" v-slot="{ field, meta }">
                      <RadioButton v-bind="field" :inputId="`${option.name.split(' ').join('_')}${option.id}`"
                          :name="name" :value="option.id" @change="$emit('update:modelValue', meta.value)"
                          v-model="proba" />
                  </Field>
              </div>
          </div>
          <ErrorMessage :name="name" />
      </div>
  </template>
  <script setup>
  import { defineProps, defineEmits, onUpdated, computed,defineOptions } from 'vue';
  import { Field, ErrorMessage } from 'vee-validate';
  import { Checkbox, MultiSelect, RadioButton } from 'primevue';
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
          required:false
      },
      modelValue: {
          type: [String, Array], // Podržava string ili niz za MultiSelect
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
      }
  });
  defineOptions({
    inheritAttrs: true
  })
  onUpdated(() => {
      if (props.multiSelect) {
          emit('update:modelValue', selected.value);
      }
  })
  const proba = computed({
      get: () => props.modelValue,
      set: (newValue) => {
          emit('update:modelValue', newValue)
      }
  });
  const selected = computed({
      get: () => props.modelValue,
      set: (newValue) => emit('update:modelValue', newValue)
  });
  const emit = defineEmits(['update:modelValue']);
  </script>
  <style>
  .form-group label {
      display: block;
      font-size: 20px;
      margin-bottom: 10px;
  }
  .w label {
      display: inline-block;
      margin-bottom: 0px;
      margin-right: 20px;
  }
  .form-group {
      margin: 20px 0px;
  }
  input {
      width: 100%;
      border-radius: 8px;
      outline: none;
      padding: 10px 10px;
      font-size:16px !important;
      border: 1px solid rgba(0,0,0,0.2);
  }
  .w {
      width: 100%;
  }
  .form-group:has(>.w) {
      flex-direction: column;
      align-items: flex-start !important;
  }
  .form-input input{
    background-color: transparent;
    color: white;
    border:none;
    border-bottom: 2px solid white;
  }
  .d-flex{
    display: flex;
  }
  .moj-tajmer-input input{
    border:1px solid rgba(0,0,0,0.25) !important;
    padding: 8px 10px;
    border-radius:8px !important;
  }
  .moj-tajmer-input input::placeholder{
    color:rgba(0,0,0,0.6);
  }
  .flex .p-multiselect{
    width: 50%;
  }
  .w > div{
    margin-bottom: 0.5rem;
  }
  </style>