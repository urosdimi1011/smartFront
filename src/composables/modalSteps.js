import { ref,computed } from 'vue';
import { showModal } from './modal';

const { close } = showModal();
export function makeStepsForModal() {
    const currentStep = ref(1);
    const formData = ref({
        step1: {},
        step2: {}
    });
    const nextStep = (data) => {

        if (currentStep.value === 1) formData.value.step1 = data;
        if (currentStep.value === 2) formData.value.step2 = data;

        currentStep.value += 1;

        if (currentStep.value === 3) {
            //Ovde moze da ide API zahtev !!!!
            finishAll();
        }

    }
    const seeCurrencyStep = computed(()=>{
        return currentStep.value;
    }) 
    const previousStep = () => {
        currentStep.value -= 1;
    }
    const finishAll = () => {
        formData.value = {};
        currentStep.value = 1;
        close();
    }

    return {
        nextStep, previousStep, finishAll,seeCurrencyStep,formData
    }
}


