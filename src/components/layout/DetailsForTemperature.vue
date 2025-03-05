<template>
    <h3>Posedi temperaturu</h3>
    <!-- <div class="center">
        <Knob readonly v-model="temperature" :min="0" :max="30" :step="1" :size="200" valueColor="#4caf50"
            rangeColor="#e0e0e0" />
        <div class="flex gap-2">
            <Button icon="pi pi-plus" @click="temperature++" :disabled="temperature >= 30" />
            <Button icon="pi pi-minus" @click="temperature--" :disabled="temperature <= 18" />
        </div>
    </div>
    <p>Trenutna temperatura: {{ temperature }}°C</p>
    <p class="text">Trenutna temperatura je <span>{{ details.temperature }} C</span></p>
    <p class="text">Trenutni status: <span class="color-green">UKLJUČENO</span></p>
    <h3>Promeni status</h3>
    <ToggleButton v-model="checked" size="large" onLabel="Ukljuceno" offLabel="Iskljuceno" />
    <button>Sacuvaj</button> -->
</template>
<script setup>
import 'primeicons/primeicons.css';
import { defineProps } from 'vue';
// import Knob from 'primevue/knob';
// import Button from 'primevue/button';
// import ToggleButton from 'primevue/togglebutton';
const props = defineProps({
    details: {
        type: Object,
        required: true
    }
})
// const temperature = ref(props.details.temperature);
//Ovde ce biti trenutni status dinamicki ucitan
// const checked = ref(false);
</script>
<style scoped>

</style>