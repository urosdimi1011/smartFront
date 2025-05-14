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
    position: relative;
    width:55%;
    font-weight: normal;
    margin-top: 30px;
    background-color: #4985e6;
    border: 0;
    color: #fff;
    border-radius: 0.5em;
    font-size: 1rem;
    padding: 0.375em 1em;
    transition: 0.25s ease;
    touch-action: manipulation;
    cursor: pointer;

  }
</style>