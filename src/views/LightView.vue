<template>
  <div id="LightPage" class="main page">
    <div class="group-content">
      <div v-if="groups && groups.length > 0" id="LightPage">
        <group-items v-for="item in groups" :key="item.id" :groupName="item.name" :id="item.id" :idDevice="item.id"
          :devices="item.devices" ></group-items>
      </div>
      <div v-if="groups == null" class="spinner-container">
        <ProgressSpinner/>
      </div>
      <div v-if="groups && groups.length === 0">
        <h3 class="header-text">Nemate uredjaje</h3>
      </div>
    </div>
    
  </div>
</template>
<script setup>
import {computed, onMounted, defineProps, provide, onDeactivated} from 'vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import groupItems from '@/components/layout/GroupItems.vue';
import ProgressSpinner from 'primevue/progressspinner';

const store = useStore();
const toast = useToast();
const props = defineProps({
  idCategories: {
    type: [Number, String],
    required: true
  }
})
provide('idCategory',props.idCategories);

async function fetchItems() {
  try{
    await store.dispatch('group/getAllGroup');
  }
  catch(error){
    toast.error(error, {
        timeout: 3000
      });
  }
}
const groups = computed(()=>{
  return store.state.group.groups != null ? store.getters['group/getAllFilterGroup'](props.idCategories) : null;
})

onMounted(() => {
  fetchItems();
});
onDeactivated(()=>{
  groups.value = null;
})
</script>

<style></style>