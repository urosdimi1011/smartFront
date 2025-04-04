<template>
<!--  ,offline : data.is_out_of_range-->
<!--  !data.is_out_of_range ? toggleActive() : null-->
    <div @click.stop="!data.is_out_of_range ? toggleActive() : null" :data-id="data.id" class="lamp background-block" :class="{active: active,offline : data.is_out_of_range }">
       <div class="content-up">
         <div>
                <template v-if="data.category.name == 'Plug' && data.status == 0">
                    <PhPlugs :size="48" />
                </template>
                <template v-if="data.category.name == 'Plug' && data.status">
                    <PhPlugsConnected :size="48" />
                </template>
                <template v-if="data.category.name != 'Plug'">
                    <i :class="data.category.icon"></i>
                </template>
                <div v-if="showInputField" class="name-block">
                    <p>{{ data.name }}</p>
                </div>
                <div @click.stop v-if="!showInputField" class="form-change-input">
                    <!-- <span @click.stop="changeNameOfInput()"><i class="fa-solid fa-xmark"></i></span> -->
                    <input type="text" id="nameOfDevice" :value="data.name" @input="onInputChange" />
                    <ButtonMy class="color-button" @click.stop="changeName()"><i class="fa-solid fa-check"></i></ButtonMy>
                </div>
              <div v-if="data.is_out_of_range" class="outOfRange">
                <p>Uredjaj je van mreže</p>
                <p><PhWifiX :size="32" /></p>
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
                        <span><i class="fa-solid fa-trash"></i></span>
                    </button>
                    <button @click.stop="changeNameOfInput()">
                        <span><i class="fa-solid fa-pencil"></i></span>
                    </button>
                  <button @click.stop="showConfigModal()" v-if="data.hasBrightness">
                    <span><i class="fa-solid fa-gear"></i></span>

                  </button>
                </div>
            </transition>
        </div>

        <Teleport to="body">
            <modal-layout :props="defineMyProps" :modalContent="modalContent" :confirm="confirm" :visible="isOpen" @close="close()">
            </modal-layout>
<!--            <modal-layout title="Promeni lozinku" :modalContent="modalContent"  :confirm="confirm" :visible="isOpen" :close="close()">-->
<!--            </modal-layout>-->
        </Teleport>


    </div>
</template>
<script setup>
import { ref, defineProps, onUpdated } from 'vue';
import modalLayout from '../modalLayout.vue';
import { showModal } from '../../composables/modal'
import { PhPlugs, PhPlugsConnected,PhWifiX } from "@phosphor-icons/vue";
const { isOpen, show, close, confirm, modalContent } = showModal();
// Ovo je globalan objekat sa podacima
import store from '@/store';
import { useToast } from 'vue-toastification';
import BrightnessLayout from "@/components/layout/BrightnessLayout.vue";
const toast = useToast();
const props = defineProps({
    data: {
        type: Object,
        required: true
    }
});
onUpdated(() => {
    active.value = props.data.status;
});
const active = ref(props.data.status);
const showInputField = ref(true);
const doShowAdcConf = ref(false);
const defineMyProps = ref([]);
//Promena statusa uredjaju
async function toggleActive() {
    // Ovde treba da se prosledi dispathc za promenu statusa device!
    try {
        const data = {
            status: !active.value,
            id: props.data.board
        };
        await store.dispatch('device/changeStatusOfDevice', data);
        // active.value = props.data.status;
        toast.success("Uspesno ste promeni status uredjaju", { timeout: 3000 });
    }
    catch (error) {
        toast.error(error.message, { timeout: 3000 });
    }

}

const tempName = ref(props.data.name);

const removeDevice = () => {
    show(`Da li ste sigurni da zelite da obrisete uredjaj ${props.data.name}`, deleteDevice);
}
const showConfigModal = ()=>{
  defineMyProps.value = {'id' : props.data.id, 'brightness': props.data.brightness}
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

</script>
<style>
.color-button{
  background-color: #87c33e !important;
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
.outOfRange{
  position: absolute;
  top:0;
  z-index: 1;
  width:100%;
  left: 0;
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
  animation: blink 1s infinite alternate;
}
@keyframes blink {
  0% { opacity: 1; }
  100% { opacity: 0.5; }
}
/* button{
    margin-top: 20px !important;
} */

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
    padding: 5px 0px;
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
/* .line{
    position:absolute;
    top: 96%;
    width: 100%;
    height: 2px;
    background-color: black;
} */
</style>