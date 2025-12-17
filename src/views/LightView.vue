<template>
  <div id="LightPage" class="main page">
    <div class="group-content">
      <div v-if="!isLoading && groups && groups.length > 0" id="LightPage">
        <group-items v-for="item in groups" :removeOption="false" :key="item.id" :groupName="item.name" :id="item.id" :idDevice="item.id"
          :devices="item.devices"></group-items>
      </div>
      <!-- <div v-if="groups == null" class="spinner-container">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
          aria-label="Custom ProgressSpinner" />
      </div> -->
      <div v-if="!isLoading && groups && groups.length === 0" class="empty-state">
        <div>
          <Icon icon="bi:lightbulb-off" width="40" height="40" />
        </div>
        <h3 class="empty-title">Ne postoje grupe u kojima su uređaji <strong>Rasvetu</strong></h3>
      </div>

    </div>
  </div>
</template>
<script setup>
import { computed, defineProps, provide, onDeactivated } from 'vue';
import { useStore } from 'vuex';
import groupItems from '@/components/layout/GroupItems.vue';
import { Icon } from '@iconify/vue';

const store = useStore();
const props = defineProps({
  idCategories: {
    type: [Number, String],
    required: true
  }
})
provide('idCategory', props.idCategories);

const isLoading = computed(() => {
  return store.getters['device/isLoading'] || store.getters['group/isLoading'];
});

const groups = computed(() => {
  return store.state.group.groups != null ? store.getters['group/getAllFilterGroup'](props.idCategories) : null;
})



</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  color: white;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f8f9ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin: 1rem 0 0.5rem 0;
  line-height: 1.3;
}

.empty-title strong {
  color: #6366f1;
  font-weight: 700;
}

.empty-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
  max-width: 400px;
}

.header-text {
  margin-top: 2rem;
}
</style>