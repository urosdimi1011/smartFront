<template>
<!--  !data.is_out_of_range ? toggleActive() : null-->
<!--  offline : data.is_out_of_range-->
  <template v-if="!data.is_out_of_range">
    <div @click.stop="!data.is_out_of_range ? toggleActive() : null" :data-id="data.id" class="lamp background-block" :class="{active: active,isToggling : isToggling,offline : data.is_out_of_range}">
      <div>
        <info-tooltip>
          <ul>
            <li>Board uredjaja: <strong>{{data.board}}</strong></li>
            <li>Pin uredjaja: <strong>{{data.pin}}</strong></li>
          </ul>
        </info-tooltip>
        <div class="content-up" >
          <ProgressSpinner v-if="isToggling" style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
                           animationDuration=".5s" aria-label="Custom ProgressSpinner" />
          <div v-else>
            <template v-if="data.category.name === 'Plug' && data.status === 0">
              <PhPlugs :size="48" />
            </template>
            <template v-if="data.category.name === 'Plug' && data.status">
              <PhPlugsConnected :size="48" />
            </template>
            <template v-if="data.category.name !== 'Plug'">
              <i :class="data.category.icon"></i>
            </template>
            <div v-if="showInputField" class="name-block">
              <p>{{ data.name }}</p>

            </div>
            <div @click.stop v-if="!showInputField" class="form-change-input">
              <input type="text" id="nameOfDevice" :value="data.name" @input="onInputChange" />
              <ButtonMy class="color-button" @click.stop="changeName()"><i class="fa-solid fa-check"></i></ButtonMy>
            </div>
          </div>
        </div>
        <div class="content-down">
          <!-- <hr class="line"/> -->
          <button class="down-button" @click.stop="showAdcConf()"><i :class="{ rotate: doShowAdcConf }"
                                                                     class="fa-solid fa-arrow-down"></i></button>
          <transition name="slidedown" mode="out-in">
            <div @click.stop v-if="doShowAdcConf" class="content-conf">
              <button @click.stop="removeDevice()">
                <p><PhTrash :size="25" /></p>
              </button>
              <button @click.stop="changeNameOfInput()">
                <p><PhPencil :size="25" /></p>
              </button>
              <button @click.stop="showConfigModal()" v-if="data.hasBrightness">
                <span><i class="fa-solid fa-gear"></i></span>
              </button>
            </div>
          </transition>
        </div>
      </div>
      <Teleport to="body">
        <modal-layout :title="titleOfModal" :props="defineMyProps" :modalContent="modalContent" :confirm="confirm" :visible="isOpen" @close="close()">
        </modal-layout>
      </Teleport>
    </div>
  </template>
  <template v-else>
    <div class="offline lamp backgr ound-block">
      <info-tooltip>
        <ul>
          <li>Board uredjaja: <strong>{{data.board}}</strong></li>
          <li>Pin uredjaja: <strong>{{data.pin}}</strong></li>
        </ul>
      </info-tooltip>
      <div class="content-up">
        <div>
          <div class="outOfRange">
            <p>Uredjaj <strong>{{ data.name }}</strong> je van mreže</p>
            <p>Vreme: {{ formatDateUTC(data.updated_date) }}</p>
            <p><PhWifiX :size="32" /></p>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>
<script setup>
import {ref, defineProps, defineOptions,computed} from 'vue';
import modalLayout from '../modalLayout.vue';
import { showModal } from '../../composables/modal';
import {ProgressSpinner} from 'primevue';
import { PhPlugs, PhPlugsConnected,PhWifiX,PhTrash,PhPencil } from "@phosphor-icons/vue";
defineOptions({ memo: true });
const { isOpen, show, close, confirm, modalContent } = showModal();
// Ovo je globalan objekat sa podacima
import store from '@/store';
import { useToast } from 'vue-toastification';
import BrightnessLayout from "@/components/layout/BrightnessLayout.vue";
import InfoTooltip from "@/components/ui/InfoTooltip.vue";
const toast = useToast();
const props = defineProps({
    data: {
        type: Object,
        required: true
    }
});

const active = computed(() => props.data.status);

const showInputField = ref(true);
const doShowAdcConf = ref(false);
const defineMyProps = ref([]);
const titleOfModal = ref("");
const isToggling = ref(false);

//Promena statusa uredjaju
async function toggleActive() {
    // Ovde treba da se prosledi dispathc za promenu statusa device!
    if (isToggling.value) return;

    isToggling.value = true;
    try {

        const data = {
            status: !active.value,
            id: props.data.board,
            pin : props.data.pin
        };
        console.log(data)
        await store.dispatch('device/changeStatusOfDevice', data);
        // active.value = props.data.status;
        toast.success("Uspesno ste promeni status uredjaju", { timeout: 3000 });
    }
    catch (error) {
      console.log(error);
        toast.error(error.message, { timeout: 3000 });
    }
    finally {
      isToggling.value = false;
    }

}

const tempName = ref(props.data.name);
// const printTextFotTooltip = ()=>{
//   return `<ul>
//     <li>Board uredjaja: <strong>${props.data.board}</strong></li>
//     <li>Pin uredjaja: <strong>${props.data.pin}</strong></li>
// </ul>`
// }
const removeDevice = () => {
  titleOfModal.value = "Potvrda";
  show(`Da li ste sigurni da zelite da obrisete uredjaj ${props.data.name}`, deleteDevice);
}
const showConfigModal = ()=>{
  defineMyProps.value = {'id' : props.data.id, 'brightness': props.data.brightness}
  titleOfModal.value = "Podesite osvetljenje";
  show(BrightnessLayout);
}
const deleteDevice = async () => {
    //slanje zahteva za brisanje
    try {
        await store.dispatch("device/deleteDevice", { id: props.data.id });
        toast.success("Uspesno ste obrisali uredjaj", { timeout: 3000 });
    }
    catch (error) {
        toast.error(error.message, { timeout: 3000 });
    }
}
function onInputChange(event) {
    tempName.value = event.target.value;
}
function changeNameOfInput() {
    showInputField.value = !showInputField.value;
}
const showAdcConf = () => {
    doShowAdcConf.value = !doShowAdcConf.value;
}
async function changeName() {
    var objToSend = {
        id: props.data.id,
        name: tempName.value
    }
    try {
        await store.dispatch("device/changeNameOfDevice", objToSend);
        showInputField.value = true;
        toast.success("Uspesno ste promenili ime", { timeout: 3000 });
    }
    catch (error) {
        toast.error(error, {
            timeout: 3000
        });
    }
}

const formatDateUTC = (dateString) => {
  const date = new Date(dateString);
  const dan = String(date.getUTCDate()).padStart(2, '0');
  const mesec = String(date.getUTCMonth() + 1).padStart(2, '0');
  const godina = date.getUTCFullYear();
  const sati = String(date.getUTCHours()).padStart(2, '0');
  const minuti = String(date.getUTCMinutes()).padStart(2, '0');
  return `${dan}.${mesec}.${godina}. ${sati}:${minuti}H`;
};


</script>
<style scoped>
.color-button{
  background-color: #87c33e !important;
}
ul{
  list-style-type:none;
}
.form-change-input button {
    width: 40%;
    padding: 3px 0px;
    margin: 15px 0px;
}

.form-change-input {
    padding-top: 10px;
}

.form-change-input button i {
    font-size: 25px;
}
.outOfRange p{
  color:black;
  text-align: center;
  width:100%;
}
.lamp.offline {
  background-color: #ffe6e6;
  color: #d32f2f;
  border: 2px solid #f44336;
}
.form-change-input span i {
    font-size: 15px;
}
.name-block {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding-bottom: 20px;
}

.name-block i {
    font-size: 15px !important;
    vertical-align: middle;
}

.content-down {
    position: relative;
    border-top: 1px solid black;
    padding: 0px 10px;
}

.content-down i {
    font-size: 15px;
    padding-top: 4px;
}

.content-conf {
    display: flex;
    justify-content: space-between;
    gap:10px;
    /* gap: 50%; */
}

.content-conf button {
    background-color: transparent;
    padding: 18px 15px;
    width: 40%;
    margin-bottom: 4px;
    border-radius: 8%;
    cursor:pointer;
}

.content-conf button:nth-child(1) {
    background-color: red;
}

.content-conf button:nth-child(2) {
    background-color: green;
}

.content-conf button:nth-child(3) {
  background-color: #cbcbcb;
}

.content-conf i {
    padding: 0px;
    color: white;
    font-size: 20px;
}

.down-button {
    width: 100%;
    color: black;
    padding: 10px 0px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: all 300ms;
}

.rotate {
    transform: rotate(180deg);
    /* padding-top: 5px; */
}

.down-button:has(>.rotate) {
    padding-top: 10px;
}

.content-up {
    min-height: 6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}
.active{
  border:1px solid white;
}
.isToggling{
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 1000;
}
/* .line{
    position:absolute;
    top: 96%;
    width: 100%;
    height: 2px;
    background-color: black;
} */
</style>