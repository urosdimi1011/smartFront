<template>
  <div>
    <h3>Podesite osvetljenje</h3>
    <knob-block v-model="brightnessLocal"></knob-block>
    <button-my @click="sendData()">Sačuvaj</button-my>
  </div>
</template>
<script setup>
import KnobBlock from "@/components/layout/KnobBlock.vue";
import ButtonMy from "@/components/ui/ButtonMy.vue";
import {ref,defineProps} from 'vue';
import {useStore} from "vuex";
import {useToast} from "vue-toastification";
const store = useStore();
const toast = useToast();
const props = defineProps({
  id : Number,
  brightness : Number
})
const brightnessLocal = ref(props.brightness);

const sendData = async ()=>{
  try{
    await store.dispatch('device/changeBrightnessForDevice',{id : props.id,brightness: brightnessLocal.value});

    toast.success("Uspesno ste promenili osvetljenje",{
      timeout: 3000
    });

  }
  catch (error){
    toast.error(error.message,{
      timeout: 3000
    });


  }
}
</script>
<style>

</style>