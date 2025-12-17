<template>
  <div v-if="visible" class="modal-overlay">
    <transition name="fade">
      <div class="modal-content " :style="{width : (currentStepProps ? (currentStepProps.width || width) : width)}" @click.stop>
        <header class="modal-header">
          <slot name="header">
            <h2>{{ currentStepProps.title || title }}</h2>
          </slot>
          <button @click="close" class="close-set-d"><Icon icon="material-symbols-light:cancel-outline" width="32" height="32" /></button>
        </header>

        <section class="modal-body">
          <div v-if="isLoading" class="modal-loading">
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s"
          aria-label="Custom ProgressSpinner"/>
          </div>
          <div v-else-if="currentStepComponent">
            <component :is="currentStepComponent" v-bind="currentStepProps" ref="currentFormRef"
              @onSubmit="changeValuesOnForm" @close="close()"  @changeForms="handleFormChange"/>
            <!-- <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p> -->
          </div>
          <div v-else>
            <slot name="body">
              <!-- <h2>Potvrda</h2> -->
              <!-- Znaci ovo je default ukoliko se ne prosledi koja komponenta ce se ucitati, onda ce ovaj deo,
                ali potrebno je da prosledimo ove funkcije confirm i close, a show funkcija poziva u drugom delu open metodu -->
              <component v-if="typeof modalContent === 'object'" :is="modalContent" v-bind="props.props" @close="close()" @changeForms="handleFormChange"></component>
              <p v-else>{{ modalContent }}</p>
              <div class="modal-actions" v-if="typeof modalContent !== 'object'">
                <ButtonMy size="small" variant="glass" @click="confirm">
                  <template #icon>
                    <Icon icon="line-md:circle-to-confirm-circle-transition" width="22" height="22" />  
                  </template>
                  Da</ButtonMy>
                <ButtonMy size='small' variant='glass' @click='close'>
                <template #icon>
                  <Icon icon="material-symbols-light:cancel-outline-rounded" width="22" height="22" />
                </template>
                Ne</ButtonMy>
              </div>
            </slot>
          </div>
        </section>
        <slot name="steps" :nextStep="nextStep" :previousStep="previousStep" :hasNext="hasNext" :hasPrevious="hasPrevious">
          <section v-if="hasMultipleSteps && hasValidatingSteps" class="modal-footer">
            <ButtonMy  variant="glass" v-if="hasPrevious()" @click="previousStep" :disabled="!hasPrevious()">Prethodni korak
              <template #icon>
                <Icon icon="ion:arrow-back-circle-outline" width="22" height="22" />
              </template>
            </ButtonMy>
            <ButtonMy  variant="glass" v-if="hasNext()" :disabled="!isFormValid" @click="nextStep">Sledeće
              <template #icon>
                <Icon icon="carbon:next-outline" width="22" height="22" />
              </template>
            </ButtonMy>
            <ButtonMy  v-else variant="glass" @click="finishAll" :disabled="!isFormValid">Zavrsi
              <template #icon>
                <Icon icon="ep:finished" width="22" height="22" />
              </template>
            </ButtonMy>
          

          </section>
        </slot> 
      </div>
    </transition>
  </div>
</template>
<script setup>
import { defineProps, defineEmits, watch, ref, computed,onMounted ,nextTick} from 'vue';
import ButtonMy from './ui/ButtonMy.vue';
import { Icon } from '@iconify/vue';
import { ProgressSpinner } from 'primevue';
const props = defineProps({
  title: {
    type: String,
    required: false,
    default: ""
  },
  visible: {
    type: Boolean,
    default: false
  },
  modalContent: {
    type: [String, Object],
    default: '',
  },
  props : {
    type : [Object, Array],
    required:false,
    default: () => { }
  },
  confirm: {
    type: Function,
    required: false,
    default: () => { }
  },
  close: {
    type: Function,
    required: false,
    default: () => { }
  },
  steps: {
    type: Array,
    default: () => [],
  },
  width:{
    type:String,
    default:"500px"
  }
});

const localData = ref([]);
const currentFormRef = ref(null);
const currentStepIndex = ref(0);
const isValid = ref(false);
const isLoading = ref(false);
let errorMsg = ref('');
const isFormValid = computed(() => {
  // Ova logika će se ponovo izvršiti kad god se promeni bilo šta relevantno
  console.log(isValid.value);
  return currentFormRef.value ? isValid.value : true;
});



const hasMultipleSteps = computed(() => props.steps.length > 1);
onMounted(()=>{
  console.log(hasMultipleSteps);
})
//Ovo ovde samo proverava da li treba da se prikazuju uopste dugmici za previous i next!
const hasValidatingSteps = computed(() => {
  const result = props.steps.every((x) => {
    const hasProps = x.props && x.props.previousValue !== undefined;
    console.log('Step:', x.component?.name || x.component, 'has props:', hasProps, 'props:', x.props);
    return hasProps;
  });
  console.log('hasValidatingSteps:', result);
  return result;
});

const currentStep = computed(() =>
  hasMultipleSteps.value ? props.steps[currentStepIndex.value] : props.steps[0]
);
const handleFormChange = async (selectedForm) => {
  emit('changeForms', selectedForm);
};
const currentStepComponent = computed(() => currentStep.value?.component || null);
const currentStepProps = computed(() => currentStep.value?.props || {});

const hasPrevious = () => currentStepIndex.value > 0;
const hasNext = () => {
  return currentStepIndex.value < props.steps.length - 1
};

const previousStep = () => {
  if (hasPrevious()) currentStepIndex.value--;
};

const nextStep = async () => {
  if (await isValidateToNextStep()) currentStepIndex.value++;
};
const resetModal = (shouldReset = true) => {
  if (shouldReset) {
    currentStepIndex.value = 0;
  }
  localData.value = [];
  errorMsg.value = '';
};
const validateCurrentStep = async () => {
  //Ovde smo stavili da ako nema funkcije validate da se normalno i ne radi validacija, vec da se samo kaze da je uspesno
  //validirano
  if (currentFormRef.value && currentFormRef.value.validate) {

    const { valid, errors } = await currentFormRef.value.validate();
    return { valid, errors };
  }
  //Ovde znaci da nema modal validacije i da moze normalno da se predje na sledeci korak
  return { valid: true };
};
const isValidateToNextStep =async () => {
  const validation  = await validateCurrentStep();
  isValid.value = validation.valid;
  if (hasNext() && validation.valid===false) {
    var messages= Object.values(validation.errors);
    printErrorMessage(messages.join(','));
    return false;
  }
  if(validation.errors){
    var messages1= Object.values(validation.errors);
    printErrorMessage(messages1.join(", "));
  }
  return validation.valid;
};

watch([currentStepIndex, () => props.steps], async () => {
  // Sačekaj da se komponenta mount-uje
  await nextTick();
  await isValidateToNextStep();
}, {deep : true });

// watch([currentStepIndex, () => props.steps], async () => {
//   await isValidateToNextStep();
// }, { immediate: true });

const printErrorMessage = (message) => {
  errorMsg.value = message;
}

const emit = defineEmits(['close', 'finish', 'getDatas','changeForms']);

const close = () => {
  isLoading.value = false; 
  resetModal(true);
  emit('close');
};
const finishAll = async () => {
  isLoading.value = true;
  emit('finish', localData.value);
  resetModal(false); 
};



// const closeOnOverlay = (event) => {
//   if (event.target === event.currentTarget) {
//     close();
//   }
// };

watch(() => props.visible, (newVal) => {
  if (!newVal) close();
});


const changeValuesOnForm = async (val) => {
  //ovo sluzi da prihvati podatke iz forme koja predstavlja komponentu na destroy livecycle hooks i da prosledi opet onome,
  //ko je pozvao ovo a to je HomeView za sad.
  // if(val.step - 1 == currentStepIndex.value){
  errorMsg.value = "";
  localData.value.splice(currentStepIndex.value, 1);
  localData.value.push(val);

  await isValidateToNextStep();
  // if (val.validate) {
  emit('getDatas', val);
  // }


}



</script>
<style>

@media (prefers-color-scheme: dark) {

/* .modal-content{
  background-color: #00293E !important;
} */
.modal-header{
  color: #fff;
}

}

.modal-overlay .close-set-d{
  width: 3em !important;
  height: 3em !important;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  z-index: 1102;
  animation: fadeIn 0.3s forwards;
}

.modal-actions {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  margin-top: 1.2em;
}

.modal-content {
   background: rgba(0, 41, 62, 0.85); /* 50% neprozirno */

    backdrop-filter: blur(50px) saturate(1.8);
    -webkit-backdrop-filter: blur(30px) saturate(1.8);
     border: 1px solid rgba(255, 255, 255, 0.15);
    border-top: 1px solid rgba(255, 255, 255, 0.25);
    border-left: 1px solid rgba(255, 255, 255, 0.25);
  padding: 20px;
   box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  height:max-content;
  block-size: fit-content;
  overflow-y: scroll;
 border-radius: 24px;
   position: relative;
  opacity: 0;
  transform: scale(0.9);
  animation: scaleIn 0.3s forwards;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* border-bottom: 1px solid #ccc; */
  padding-bottom: 10px;
}
.modal-header h2{
  font-size: 1.1rem;
}
.modal-close {
  background: none;
  border: 1px solid rgba(0, 0, 0, 0.5);
  font-size: 18px;
  cursor: pointer;
  width: 10%;
  margin-top: 0px;
  border-radius: 10px;
  padding: 10px 0px;
  transition: all 300ms;
}

.modal-close:hover {
  background: #011134;
  color: red;
}

.modal-body {
  padding: 15px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #ccc;
  padding-top: 10px;
}

.error-msg {
  color: rgb(177, 2, 2) !important;
  font-size: 12px;
}

.modal-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 41, 62, 0.95);
  border-radius: 24px;
  z-index: 10;
}

/* Animacije */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>