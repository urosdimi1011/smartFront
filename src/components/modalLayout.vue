<template>
  <div v-if="visible" class="modal-overlay" @click="closeOnOverlay">
    <transition name="fade">
      <div class="modal-content" :style="{width : (currentStepProps ? (currentStepProps.width || width) : width)}" @click.stop>
        {{currentStepProps}}
        <header class="modal-header">
          <slot name="header">
            <h2>{{ currentStepProps.title || title }}</h2>
          </slot>
          <button @click="close" class="close-button close-set-d">X</button>

        </header>

        <section class="modal-body">
          <div v-if="currentStepComponent">
            <component :is="currentStepComponent" v-bind="currentStepProps" ref="currentFormRef"
              @onSubmit="changeValuesOnForm" @close="close()"/>
            <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
          </div>
          <div v-else>
            <slot name="body">
              <!-- <h2>Potvrda</h2> -->
              <!-- Znaci ovo je default ukoliko se ne prosledi koja komponenta ce se ucitati, onda ce ovaj deo,
                ali potrebno je da prosledimo ove funkcije confirm i close, a show funkcija poziva u drugom delu open metodu -->
              <p>{{ modalContent }}</p>
              <div class="modal-actions">
                <ButtonMy @click="confirm">Da</ButtonMy>
                <ButtonMy @click="close">Ne</ButtonMy>
              </div>
            </slot>
          </div>
        </section>
        <slot name="steps" :nextStep="nextStep" :previousStep="previousStep" :hasNext="hasNext" :hasPrevious="hasPrevious">
          <section v-if="hasMultipleSteps && hasValidatingSteps" class="modal-footer">

            <ButtonMy v-if="hasPrevious()" @click="previousStep" :disabled="!hasPrevious()">Prethodni korak</ButtonMy>
            <ButtonMy v-if="hasNext()" @click="nextStep">Sledece</ButtonMy>
            <ButtonMy v-else @click="finishAll">Zavrsi</ButtonMy>

          </section>
        </slot> 
      </div>
    </transition>
  </div>
</template>
<script setup>
import { defineProps, defineEmits, watch, ref, computed } from 'vue';
import ButtonMy from './ui/ButtonMy.vue';

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
    type: String,
    default: '',
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
let errorMsg = ref('');
const hasMultipleSteps = computed(() => props.steps.length > 1);

//Ovo ovde samo proverava da li treba da se prikazuju uopste dugmici za previous i next!
const hasValidatingSteps = computed(() => props.steps.every((x) => x.props && x.props.previousValue));
const currentStep = computed(() =>
  hasMultipleSteps.value ? props.steps[currentStepIndex.value] : props.steps[0]
);

const currentStepComponent = computed(() => currentStep.value?.component || null);
const currentStepProps = computed(() => currentStep.value?.props || {});

const hasPrevious = () => currentStepIndex.value > 0;
const hasNext = () => {
  console.log(currentStepIndex.value) 
  return currentStepIndex.value < props.steps.length - 1
};

const previousStep = () => {
  if (hasPrevious()) currentStepIndex.value--;
};

const nextStep = async () => {
  if (await isValidateToNextStep()) currentStepIndex.value++;
};

const isValidateToNextStep = async () => {
  const isValid = await validateCurrentStep();
  console.log(isValid);
  if (hasNext() && isValid.valid===false) {
    var messages= Object.values(isValid.errors);
    printErrorMessage(messages.join(','));
    return false;
  }
  if(isValid.errors){
    console.log("Usli");
    var messages1= Object.values(isValid.errors);
    printErrorMessage(messages1.join(", "));

  }
  return isValid.valid;
}

const printErrorMessage = (message) => {
  errorMsg.value = message;
}

const emit = defineEmits(['close', 'finish', 'getDatas']);

const close = () => {
  emit('close');
};
const finishAll = async () => {

  if (await isValidateToNextStep()) emit('finish');
  // const isValid = await validateCurrentStep();
  // if (isValid.valid) {
  // emit('finish');/
  // } else {
  // errorMsg.value = 'Polja moraju da budu popunjena';
  // }
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

const closeOnOverlay = (event) => {
  if (event.target === event.currentTarget) {
    close();
  }
};

watch(() => props.visible, (newVal) => {
  if (!newVal) close();
});


const changeValuesOnForm = (val) => {
  //ovo sluzi da prihvati podatke iz forme koja predstavlja komponentu na destroy livecycle hooks i da prosledi opet onome,
  //ko je pozvao ovo a to je HomeView za sad.
  // if(val.step - 1 == currentStepIndex.value){
  errorMsg.value = "";
  localData.value.splice(currentStepIndex.value, 1);
  localData.value.push(val);
  // if (val.validate) {
  emit('getDatas', val);
  // }


}



</script>
<style>
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
  z-index: 100;
  animation: fadeIn 0.3s forwards;
}

.modal-actions {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.modal-content {
  background: white;
  padding: 20px;
  width: 500px;
  max-width: 100%;
  max-height: 80vh;
  height:max-content;
  block-size: fit-content;
  overflow-y: scroll;
  border-radius: 8px;
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
  border-top: 1px solid #ccc;
  padding-top: 10px;
}

.error-msg {
  color: rgb(177, 2, 2);
  font-size: 20px;
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