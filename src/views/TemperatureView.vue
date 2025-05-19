<template>
    <div class="group-content">
        <div class="buttons">
            <!-- Mogao bih da buttone smestim u posebnu komponentu             -->
            <ButtonMy @click="getDevices('heating')" class="tempButtonStyle" :class="{activeButtonClass : activeButton === 1}">Prikaži uređaje za grejanje</ButtonMy>
            <ButtonMy @click="getDevices('cooling')" class="tempButtonStyle" :class="{activeButtonClass : activeButton === 2}">Prikaži uređaje za hladjenje</ButtonMy>
        </div>
        <group-items class="temperature-block" :does-change-group-name-props="false" :add-device-options="false" :automaticOpen="openSlide" :devices="devicesActive" :showButtonOfTurnAll="false" groupName="Lista uredjaja"></group-items>
    </div>
</template>
<script setup>
import { ref,onMounted,provide,computed } from 'vue';
import groupItems from '../components/layout/GroupItems.vue';
import {useStore} from "vuex";
const items = ref([]);

const activeButton = ref([0]);
const devicesActive = computed(()=>{
  return store.getters['device/getDeviceOfTemperatureForSelectedType'];
});
const openSlide = ref(false);
const store = useStore();
const selectedType = ref('');
provide('isSwitched',false);
provide('selectedType',selectedType);

async function fetchItems() {
  // Simulacija dohvatanja podataka
  const response = await fetch('/api/light.json');
  items.value = await response.json();
}

async function getDevices (type){
    if(type === 'heating'){
        activeButton.value = 1;
        //prikaz uredjaja za grejanje
        selectedType.value = 'Heating';
        await store.dispatch('device/getAllDevicesForTemperature','Heating');
    }
    else {
      activeButton.value = 2;
      selectedType.value = 'Cooling';
      await store.dispatch('device/getAllDevicesForTemperature','Cooling');
        //prikaz uredjaja za hladjenje
    }
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
      color: #fff;
      border:2px solid transparent;
    }
    .buttons .activeButtonClass{
        border:2px solid #fff;
    }

</style>