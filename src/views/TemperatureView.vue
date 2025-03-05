<template>
    <div class="group-content">
        <div class="buttons">
            <!-- Mogao bih da buttone smestim u posebnu komponentu             -->
            <ButtonMy @click="getDevices('heating')" :class="{activeButtonClass : activeButton == 1}" class="lamp background-block">Prikaži uređaje za grejanje</ButtonMy>
            <ButtonMy @click="getDevices('cooling')" :class="{activeButtonClass : activeButton == 2}" class="lamp background-block">Prikaži uređaje za hladjenje</ButtonMy>
        </div>

        <group-items :automaticOpen="openSlide" :devices="devicesActive" :showButtonOfTurnAll="false" groupName="Lista uredjaja"></group-items>
    </div>
</template>
<script setup>
import { ref,onMounted,provide } from 'vue';
import groupItems from '../components/layout/GroupItems.vue';
const items = ref([]);

const activeButton = ref([0]);
const devicesActive = ref([]);
const openSlide = ref(false);


provide('isSwitched',false);

async function fetchItems() {
  // Simulacija dohvatanja podataka
  const response = await fetch('/api/light.json');
  items.value = await response.json();
}

async function getDevices (type){
    if(type === 'heating'){
        activeButton.value = 1;
        //prikaz uredjaja za grejanje
        const response = await fetch('/api/heating.json');
        devicesActive.value = await response.json();
    }
    else {
        activeButton.value = 2;
        const response = await fetch('/api/cooling.json');
        devicesActive.value = await response.json();
        //prikaz uredjaja za hladjenje
    }
    console.log(devicesActive.value);
    openSlide.value = true;
}

//Omoguci normalan toggle kada se automaticOpen postavi na true, i vidi zasto ne moze da se setuje unapred polju vrednost !!!!

onMounted(() => {
  fetchItems();

  getDevices('heating');
});
</script>

<style scoped>
    .buttons{
        color: #fff;
    }
    .buttons button{
        color: white;
    }
    .activeButtonClass{
        border-color: green;
    }
</style>