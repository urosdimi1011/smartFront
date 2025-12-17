<template>
  <div class="wifi-qr-container">
    <p>Povežite svoj uređaj na Wi-Fi:</p>
    <p><strong>Naziv wifi mreže:</strong> SMARTERA:0000</p>
    <!-- <p v-if="password"><strong>Lozinka:</strong> {{ password }}</p> -->
    <p>Ili putem QR koda:</p>
    <qrcode-vue
        :value="qrValue"
        :size="200"
        :level="'H'"
        />

    <strong class="note">
      <span>Napomena:</span> Isključite mobilne podatke i povežite se na Wi-Fi uređaja.
    </strong>
     <ButtonMy :loading="isLoading" class="w-100" variant="glass" @click="showLink()">Klikni za konfiguraciju</ButtonMy>
  </div>
</template>

<script setup>
import QrcodeVue from 'qrcode.vue';
import { computed,defineProps, ref } from 'vue';
import ButtonMy from './ButtonMy.vue';
const isLoading = ref(false);
const props = defineProps({
  ssid: {
    type: String,
    required: true
  },
  tempLink: {
    type: String,
    required: true
  }
});
const qrValue = computed(() => {
  // Za otvoreni Wi-Fi ne stavljamo tip enkripcije ni lozinku
  return `WIFI:S:SMARTERA:0000;;`;
});
const showLink = () => {
    isLoading.value = true;
    window.location.href = props.tempLink;
}
</script>

<style scoped>
.wifi-qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 41, 62, 0.2);
  border-radius: 12px;
  text-align: center;
}

.note {
  font-size: 0.875rem;
  color: #fff;
}
.w-100{
    width: 100%;
}
.note span {
  color: rgb(216, 37, 37) !important;
}
</style>