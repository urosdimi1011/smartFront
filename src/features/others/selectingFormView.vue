<template>
     <ButtonMy v-for="(index,value) in textOnButtons" :key="value" @click="showForms(showModals[value])">
        {{index}}
     </ButtonMy>
</template>
<script setup>
import { defineEmits,defineProps} from 'vue';

defineProps({
    textOnButtons : {
        type: Array,
        required : true
    },
    showModals : {
        type: Array,
        required : true
    }
})
const emit = defineEmits('changeForms');

const showForms = (selectedDevice)=>{
    emit('changeForms',selectedDevice);
}

</script>