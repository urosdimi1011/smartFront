<template>
     <ButtonMy size="small" variant="glass" class="button-width" v-for="(button,index) in buttons" :key="index" @click="showForms(button.modalId)">
            <template v-if="button.icon != null" #icon>
                <Icon :icon="button.icon" color="green"/>
            </template>
        {{button.text}}
     </ButtonMy>
</template>
<script setup>
import { defineEmits,defineProps, onMounted} from 'vue';
import { Icon } from '@iconify/vue';
const props = defineProps({
    textOnButtons : {
        type: Array,
        required : true
    },
    showModals : {
        type: Array,
        required : true
    },
    icons:{
        type:Array,
        required:false,
        default : null
    },
     buttons: {
        type: Array,
        required: true,
        // Očekivani format: [{ text: 'Dodaj', icon: 'mdi:plus', modalId: 'addModal' }]
  }
})

const emit = defineEmits(['changeForms']);

const showForms = (selectedDevice)=>{
    emit('changeForms',selectedDevice);
}
onMounted(()=>{
    console.log(props.icons);
})

</script>
<style scoped>
.button-width{
  width: 100%;
}
:deep(.iconify) {
  width: 18px;
  height: 18px;
}
.iconify {
  display: inline-block;
  width: 1em;
  height: 1em;
}
</style>