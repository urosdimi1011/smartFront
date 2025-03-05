<template>
    <button><slot></slot></button>
</template>
<script setup>
    // import {defineProps} from "vue";

    // defineProps({
    //     text : {
    //         type: string,
    //         default: false
    //     }
    // })

</script>
<style scoped>
button {
  margin-top: 50px;
  width: 100%;
  background-color: #87c33e;
  color: #080710;
  padding: 15px 0;
  font-size: 18px;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 1px #bbb;
}
button:active {
  box-shadow: 0 0px #999;
  transform: translateY(1px);
}
</style>