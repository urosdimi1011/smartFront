<template>
  <div class="info-wrapper" ref="wrapperRef" @click.stop="toggleTooltip">
    <span class="info-icon"><i class="fas fa-info-circle"></i></span>
    <div v-if="show" class="tooltip" v-html="text">
    </div>
  </div>
</template>
<script setup>
import { ref,defineProps,onMounted,onUnmounted } from 'vue'
defineProps({
  text: String
})

const show = ref(false);
const wrapperRef = ref(null);
function toggleTooltip() {
  show.value = !show.value
}
const handleClickOutside = (event)=>{
  if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
    show.value = false
  }
}

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
</style>