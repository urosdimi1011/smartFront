<template>
  <div ref="wrapperRef"> <!-- Dodaj ref oko celog sadržaja -->
    <template v-if="hasSlot">
      <div v-if="show" class="tooltip" v-bind="$attrs">
        <slot></slot>
      </div>
    </template>
    <template v-else>
      <div class="info-wrapper" @click.stop="toggleTooltip">
        <span class="info-icon"><i class="fas fa-info-circle"></i></span>
        <div v-if="show" class="tooltip" v-html="text"></div>
      </div>
    </template>
  </div>
</template>
<script setup>
import {ref, defineProps, onMounted, onUnmounted, computed,useSlots,defineOptions,defineEmits} from 'vue'
defineOptions({
  inheritAttrs: false
});
const slots = useSlots();
const show = ref(slots.default ? true : false);
defineProps({
  text: String,
})
const hasSlot = computed(() => !!slots.default);
const emit = defineEmits(['close']);
const wrapperRef = ref(null);
function toggleTooltip() {
  show.value = !show.value
}
const handleClickOutside = (event) => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
    show.value = false;
    emit('close',show.value);
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// function closeTooltip() {
//   show.value = false
// }
</script>

<style scoped>
.info-wrapper {
  position: absolute;
  display: inline-block;
  cursor: pointer;
  top:5px;
  right:5px;
}
ul {
  list-style-type:none;
}

.lamp .info-icon i{
  font-size: 18px;
  color: #15aff8;
}

.tooltip {
  position: absolute;
  top: 120%;
  left: 0%;
  transform: translateX(-100%);
  background-color: #222;
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 9999;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  text-align:left;
}
.customToolTip{
  top: 5px;
  right: 0px !important;
  transform: none !important;
  width:50% !important;
  left: unset !important;
}
.customToolTip > *{
  width:100%;
  text-wrap: initial;
}

</style>