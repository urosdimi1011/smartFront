<script setup>
import { h, computed, defineAsyncComponent, inject } from 'vue';

const componentMap = {
  DeviceItemBlock: defineAsyncComponent({
    loader: () => import('./DeviceItemBlock.vue'),
    loadingComponent: {
      render() {
        return h('div', { class: 'loader-container' }, [
          h('div', { class: 'spinner' }),
          h('p', 'Loading Device...'),
        ]);
      },
    },
    errorComponent: { render() { return h('p', 'Failed to load Device'); } },
    delay: 200,
    timeout: 3000
  }),
  TempItemBlock: defineAsyncComponent({
    loader: () => import('./TempItemBlock.vue'),
    loadingComponent: {
      render() {
        return h('div', { class: 'loader-container' }, [
          h('div', { class: 'spinner' }),
          h('p', 'Loading Temperature Block...'),
        ]);
      },
    },
    errorComponent: { render() { return h('p', 'Failed to load Temperature Block'); } },
    delay: 200,
    timeout: 3000
  }),
};

const props = inject('isSwitched', true);

const ComponentToRender = computed(() =>
  props ? componentMap['DeviceItemBlock'] : componentMap['TempItemBlock']
);
</script>

<template>
  <Transition name="fade" mode="out-in">
    <component :is="ComponentToRender" />
  </Transition>
</template>

<style>
/* Animacija za Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Loader stil */
.loader-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ccc;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
