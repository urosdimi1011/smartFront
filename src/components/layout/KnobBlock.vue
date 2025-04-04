<template>
  <div class="light-container">
    <img
        src="/img/bulb.png"
        class="light-bulb"
        :style="{
        filter: `brightness(${modelValue / 100}) drop-shadow(0px 0px ${modelValue / 5}px yellow)`
      }"
    />
    <input
        type="range"
        :value="modelValue"
        min="0"
        max="100"
        class="slider"
        @input="$emit('update:modelValue', $event.target.value)"
    />
    <p>Osvetljenje: {{ modelValue }}%</p>
  </div>
</template>

<script setup>
import {defineEmits,defineProps } from "vue";

defineEmits(['update:modelValue']);
defineProps({
  "modelValue" : Number
});


</script>

<style scoped>
.light-container {
  text-align: center;
}

.light-bulb {
  display: block;
  margin: 0 auto;
  width: 100px;
  height: 100px;
  transition: filter 0.3s ease-in-out;
  filter: invert(1);
}
.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 12px;
  border-radius: 6px;
  background: #ddd;
  outline: none;
  transition: background 0.3s ease-in-out;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2);
  position: relative;
}

/* Omogućava dinamičko bojenje */
.slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(to left, #ffcc00 0%, #ddd 100%);
  transition: background 0.3s ease-in-out;
}

/* Stilizacija dugmeta na slideru */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffcc00, gold);
  cursor: pointer;
  box-shadow: 0px 4px 10px rgba(255, 204, 0, 0.8);
  transition: transform 0.2s, box-shadow 0.2s;
  transform: scale(1);
  position: relative;
}

.slider::-webkit-slider-thumb:hover {
  background: radial-gradient(circle, gold, orange);
  box-shadow: 0px 6px 14px rgba(255, 165, 0, 0.9);
  transform: scale(1.1);
}

/* FireFox (Moz) stilizacija */
.slider::-moz-range-track {
  width: 100%;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(to right, #ffcc00 0%, #ddd 100%);
  transition: background 0.3s ease-in-out;
}

.slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffcc00, gold);
  cursor: pointer;
  box-shadow: 0px 4px 10px rgba(255, 204, 0, 0.8);
  transition: transform 0.2s, box-shadow 0.2s;
}

.slider::-moz-range-thumb:hover {
  background: radial-gradient(circle, gold, orange);
  box-shadow: 0px 6px 14px rgba(255, 165, 0, 0.9);
  transform: scale(1.1);
}

/* Poboljšanje pri fokusu */
.slider:focus {
  outline: none;
  box-shadow: 0px 0px 15px rgba(255, 204, 0, 0.6);
}

</style>