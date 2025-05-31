<template>
  <!-- {{ allCategories }} -->
  <div v-touch:swipe.left="nextPage" v-touch:swipe.right="prevPage" v-if="isOnline" class="login-background">
    <div class="tabs background-block">
      <router-link to="/" exact v-slot="{ isActive }">
        <input id="home" type="radio" name="tabsMenu" :class="{ active: isActive }" />
      </router-link>

      <template v-for="cat in allCategories" :key="cat.id">
        <template v-if="cat.name !== 'Heating' && cat.name !== 'Cooling'">
          <router-link
              :to="{ name: routeLink(cat), params: { idCategories: cat.id } }" v-slot="{ isActive }">
            <input :id="cat.name" type="radio" name="tabsMenu" :class="{ active: isActive }" />
          </router-link>
        </template>
      </template>
      <router-link
          :to="{ name: 'Temperature', }" v-slot="{ isActive }">
        <input id="temperature" type="radio" name="tabsMenu" :class="{ active: isActive }" />
      </router-link>

      <div class="buttons">
        <label for="home" :class="{ 'active-tab': isActive('/') }"><i class="fa-solid fa-house"></i></label>
        <template v-if="allCategories">
          <template v-for="cat in allCategories" :key="cat.id">
            <template v-if="cat.name !== 'Heating' && cat.name !== 'Cooling'">

            <label :for="cat.name"
                     :class="{ 'active-tab': isActive('/' + cat.name) }"><i
                  :class="cat.icon"></i></label>
            </template>
          </template>
          <label for="temperature"
                 :class="{ 'active-tab': isActive('/temperature' ) }"><i
              class="fa-regular fa-snowflake"></i></label>
          <div class="underline"></div>
        </template>
        <template v-else>
          <Skeleton size="3rem"></Skeleton>
          <Skeleton size="3rem"></Skeleton>
          <Skeleton size="3rem"></Skeleton>
        </template>
      </div>
    </div>

    <div class="main-moj container">
      <transition :name="transitionName" mode="out-in" >
        <router-view :key="$route.path" v-slot="{ Component }">
          <component :is="Component" class="view" />
        </router-view>
      </transition>
    </div>

    <div class="block-fixed">
      <div @click="showTimerModal()" class="lamp background-block">
        <PhAlarm :size="32" />
        <p>Tajmer</p>
      </div>
      <div @click="showUserModal()" class="lamp background-block">
        <PhUser :size="32" />
        <p>Korisnicki profil</p>
      </div>
    </div>


    <modal-layout v-model:currentStepIndexProps="stepIndex" :steps="components" :visible="isOpen" @close="close()">
      <template v-if="components.length > 1" #steps="{ nextStep, hasNext, previousStep }">
        <ButtonMy v-if="hasNext()" @click="nextStep()" class="form-button">Lista tajmera</ButtonMy>
        <ButtonMy v-else @click="previousStep()" class="form-button">Dodaj tajmer</ButtonMy>
      </template>
    </modal-layout>

  </div>
  <div v-else>
    <OfflineView/>
  </div>
</template>


<script setup>
import {useRoute, useRouter} from 'vue-router';
import modalLayout from '@/components/modalLayout.vue';
import TimerView from '@/views/TimerView.vue';
import OfflineView from '@/views/OfflineView.vue';
import { showModal } from '@/composables/modal';
import {shallowRef, ref, onMounted, computed, onUnmounted, watch} from 'vue';
import TimerTable from './components/layout/TimerTable.vue';
import Skeleton from 'primevue/skeleton';
const { isOpen, show, close } = showModal();
import store from '@/store';
import UserView from './views/UserView.vue';
import {PhAlarm, PhUser} from "@phosphor-icons/vue";
import MobileTimerView from "@/components/ui/MobileTimerView.vue";
import {useToast} from "vue-toastification";

const toast = useToast();
const stepIndex = ref(0);
const route = useRoute();
const router = useRouter();
const components = shallowRef([
    { component: TimerView, props: { title : "Dodajte tajmer" } },
    { component: TimerTable, props: { width: "1300px",title : "Pregled tajmera" } }
]);

const isOnline = ref(navigator.onLine); // Trenutni status interneta
const isOfflinePending = ref(false); // Flag za praćenje odlaganja offline moda
let offlineTimeout = null; // Reference za timeout funkciju
let alreadyFetched = false;
const updateOnlineStatus = () => {
  if (navigator.onLine) {
    // Ako je online, resetuj status
    isOnline.value = true;
    isOfflinePending.value = false; // Resetuj odlaganje offline moda
    clearTimeout(offlineTimeout); // Ukloni aktivan timeout ako postoji
  } else {
    isOfflinePending.value = true;
    offlineTimeout = setTimeout(() => {
      isOnline.value = false; // Postavi status na offline tek nakon 2 minuta
      isOfflinePending.value = false; // Resetuj odlaganje jer je sada stvarno offline
    }, 60000); // 120000 ms = 2 minuta
  }
};
const allCategories = computed(() => {
  return store.getters['category/getListOfCategories'];
})

const getAllCategories = async () => {
  await store.dispatch("category/getAll");
}

function isActive(path) {
  const currentPath = route.path.toLowerCase();
  const targetPath = path.toLowerCase();

  if (targetPath === "/") {
    return currentPath === "/"; // Home je aktivan samo kada je tačno /
  }

  return currentPath.startsWith(targetPath);
}
function showTimerModal() {
  const isMobile = window.innerWidth <= 768;
  if(isMobile){
    components.value = [
      { component: TimerView, props: {title : "Dodaj tajmer"} },
      { component: MobileTimerView, props: {title: "Lista tajmera"}},
    ]
  }
  else{
    components.value = [{ component: TimerView, props: {title : "Dodaj tajmer"} }, { component: TimerTable, props: { width: "1300px",title:'Lista tajmera' } }];
  }
  show();
}



async function fetchItems() {
  // Simulacija dohvatanja podataka
  //dohvatanje svih uredjaja !
  //Ovo ne znam da li treba da bude ovde!??
  try{
    await store.dispatch('group/getAllGroup');
    await store.dispatch('device/getAllDevices');
    await store.dispatch("group/assignDevicesToGroups", null, { root: true });

  }
  catch(error){
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || "Greška prilikom učitavanja podataka.";
    toast.error(`Greška: ${message}`, {
      timeout: 2000
    });
  }
}

watch(
    () => route.fullPath,
    async (newPath) => {
      if (Object.keys(routeOrder).includes(newPath)) {
        await loadData();
      }
    },
    { immediate: false }
);
const showUserModal = () => {
  components.value = [{ component: UserView,props: {title : 'Korisnički profil'} }];
  show();
}
onMounted(async () => {

  if(localStorage.getItem('token')){
    await loadData();
  }

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  // Ovde implementiram socket
  window.Echo.channel('devices')
      .listen('.status-updated', (e) => {
        store.dispatch('device/changeStatusOfDeviceWithSocket',e.device);
      });

})

async function loadData() {
  if (alreadyFetched) return; // spreči dupliranje
  alreadyFetched = true;

  try {
    getAllCategories();
    await fetchItems();
  } catch (e) {
    toast.error("Greska prilikom ucitavanja: "+ e,{timeout:2000});
  }
}

onUnmounted(() => {
  window.removeEventListener("online", updateOnlineStatus);
  window.removeEventListener("offline", updateOnlineStatus);
});
const routeLink = (cat) => {
  return cat.name === 'Heating/Cooling' ? 'Temperature' : cat.name
}



const nextPage = () => {
  if (router.currentRoute.value.path === '/') {
    router.push('/light/1'); // Idi na sledeću stranicu
  } else if (router.currentRoute.value.path === '/light/1') {
    router.push('/plug/2');
  }
  else if (router.currentRoute.value.path === '/plug/2') {
    router.push('/temperature');
  }
};

const prevPage = () => {
  if (router.currentRoute.value.path === '/temperature') {
    router.push('/plug/2'); // Vrati se nazad
  } else if (router.currentRoute.value.path === '/plug/2') {
    router.push('/light/1');
  }
  else if (router.currentRoute.value.path === '/light/1') {
    router.push('/');
  }
}
const routeOrder = {
  '/': 0,
  '/light/1': 1,
  '/plug/2': 2,
  '/temperature': 3
};
const transitionName = ref('slide-left');
let previousIndex = routeOrder[route.path] ?? 0

watch(() => route.path, (newPath, oldPath) => {
  const newIndex = routeOrder[newPath] ?? 0;

  if (newIndex > previousIndex) {
    transitionName.value = 'slide-left'
  } else {
    transitionName.value = 'slide-right'
  }

  previousIndex = newIndex;
});


</script>


<style>
* {
  margin: 0px;
  padding: 0px;
  box-sizing: border-box;
  font-family: "Instrument Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

a {
  text-decoration: none;
}
.no-scroll-x {
  overflow-x: hidden !important;
}
input:focus {
  touch-action: manipulation;
}
.form-group span{
  color:#DC2626;
}
.close-button{
  overflow: hidden;
  position:relative;
  border: none;
  padding: 0;
  width: 1em !important;
  height: 1em;
  border-radius: 50%;
  background: transparent;
  color: #1da1f2;
  font: inherit;
  text-indent: 100%;
  cursor: pointer;
}
.close-button:focus{
    outline: solid 0 transparent;
    box-shadow: 0 0 0 2px #8ed0f9
}
.close-button:hover{
    background: rgba(29, 161, 142, .1)
}
.tabs{
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 2;
  background-color: transparent;
}
.tabs .buttons{
  background-color: #00293E !important;
  border-radius: 0px 0px 20px 20px;
}
.tabs.background-block{
  border:none;
  background-color: transparent;
}
.close-button:before, .close-button:after {
  position: absolute;
  top: 15%; left: calc(50% - .0625em);
  width: .125em; height: 70%;
  border-radius: .125em;
  transform: rotate(45deg);
  background: currentcolor;
  content: ''
}
.close-button:after { transform: rotate(-45deg); }

.activeAll{
  width: 4vw;
  height: 4vh;
}
.skeleton-box {
  width: 25%;
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite linear;
  border-radius: 4px;
}

.skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@keyframes loading {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

.buttons label.active-tab {
  color: #fff;
  opacity: 1;
  filter: drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #fff);
  will-change: filter;
}

.spinner-container {
  display: flex;
}

.spinner-container .p-progressspinner {
  width: 200px;
  height: 150px;
  margin-top: 100px;
}

.group-content {
  width: 80%;
  margin: 0px auto;
  text-align: left;
}

.lamp i {
  transition: all 300ms;
  filter: drop-shadow(0px 0px 0px transparent);
  will-change: filter;
}

.lamp.active i:not(:last-child){
  filter: drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #fff);
  will-change: filter;
}

.lamp.active i:not(:last-child)::before {
  content: '\f0eb';
  font-weight: 700;
}

.lamp {
  width: 20%;
  border-radius: 5px;
  text-align: center;
  padding-top: 20px;
  cursor: pointer;
  transition: all 300ms;
  border: 1px solid transparent;
  //filter: drop-shadow(0px 0px 0px transparent);
  //will-change: filter;
  color: #fff;
  position:relative;
}

/* LEFT transition (napred) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}
.slide-left-enter-from {
  transform: translateX(100%);
}
.slide-left-enter-to {
  transform: translateX(0%);
}
.slide-left-leave-from {
  transform: translateX(0%);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}

/* RIGHT transition (nazad) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-right-enter-from {
  transform: translateX(-100%);
}
.slide-right-enter-to {
  transform: translateX(0%);
}
.slide-right-leave-from {
  transform: translateX(0%);
}
.slide-right-leave-to {
  transform: translateX(100%);
}

/* Parent container mora imati relative pozicioniranje */
.container {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}
.lamp h2 {
  margin-bottom: 40px;
}

.lamp i {
  font-size: 35px;
  text-align: center;
  color: #fff;
}

.lamp p {
  color: #fff;
  text-transform: uppercase;
  margin-top: 10px;
  //font-family: 'Poppins', sans-serif;
}

.lamp:hover {
  border: 1px solid #fff;
}

.login-background {
  min-height: 100vh;
  background-color: #00293E;
  padding-top: 137px;
}

.background {
  width: 430px;
  height: 520px;
  position: absolute;
  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;
}


.background .shape {
  height: 200px;
  width: 200px;
  position: absolute;
  border-radius: 50%;
}

.shape:first-child {
  background: url("../public/img/android-chrome-192x192.png");
  background-repeat: no-repeat;
  left: -80px;
  top: -80px;
}

.reg-block {
  text-align: center;
  margin-top: 20px;

}

.reg-block a {
  text-decoration: none;
  color: #fff;
  font-weight: bold;
  transition: all 300ms;
}

.reg-block a:hover {
  color: #87c33e;
}

.shape:last-child {
  background: #4c9cad;
  right: -30px;
  bottom: -80px;
}

.background-block {
  background-color: rgba(255, 255, 255, 0.13);
  //border: 2px solid rgba(255, 255, 255, 0.1);
  //box-shadow: 0 0 40px rgba(8, 7, 16, 0.6);
}

.login-form,
.register-form {
  height: max-content;
  width: 700px;
  background-color: #012a54;
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 40px rgba(8, 7, 16, 0.6);
  padding: 50px 35px;
  z-index: 2;
}

.login-form *,
.register-form * {
  //font-family: 'Poppins', sans-serif;
  color: #ffffff;
  letter-spacing: 0.5px;
  outline: none;
  border: none;
}

.login-form h3,
.register-form h3 {
  font-size: 32px;
  font-weight: 500;
  line-height: 42px;
  text-align: center;
}

.login-form label,
.register-form label {
  display: block;
  margin-top: 30px;
  font-size: 16px;
  font-weight: 500;
}

.login-form input,
.register-form input {
  display: block;
  height: 5vh;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.07);
  border-radius: 0.5rem;
  padding: 0 10px;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 300;
}

.register-form input {
  height: 45px !important;
}

.register-form label:first-of-type {
  margin-top: 22px;
}

.register-form label {
  margin-top: 8px;
}

::placeholder {
  color: #e5e5e5;
}

/* button {
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
} */

button:active {
  box-shadow: 0 0px #999;
  transform: translateY(1px);
}

.social {
  margin-top: 30px;
  display: flex;
}

.social div {
  background: red;
  width: 150px;
  border-radius: 3px;
  padding: 5px 10px 10px 5px;
  background-color: rgba(255, 255, 255, 0.27);
  color: #eaf0fb;
  text-align: center;
}

.social div:hover {
  background-color: rgba(255, 255, 255, 0.47);
}

.social .fb {
  margin-left: 25px;
}

.social i {
  margin-right: 4px;
}

.checkbox {
  width: 20px;
}

/* Checkbox stil */
.checkbox-label {
  display: inline-block !important;
}

.tgl-btn {
  margin-top: 5px !important;
}

.checkbox-wrapper-7 .tgl {
  display: none;
}

.checkbox-wrapper-7 .tgl,
.checkbox-wrapper-7 .tgl:after,
.checkbox-wrapper-7 .tgl:before,
.checkbox-wrapper-7 .tgl *,
.checkbox-wrapper-7 .tgl *:after,
.checkbox-wrapper-7 .tgl *:before,
.checkbox-wrapper-7 .tgl+.tgl-btn {
  box-sizing: border-box;
}

.checkbox-wrapper-7 .tgl::-moz-selection,
.checkbox-wrapper-7 .tgl:after::-moz-selection,
.checkbox-wrapper-7 .tgl:before::-moz-selection,
.checkbox-wrapper-7 .tgl *::-moz-selection,
.checkbox-wrapper-7 .tgl *:after::-moz-selection,
.checkbox-wrapper-7 .tgl *:before::-moz-selection,
.checkbox-wrapper-7 .tgl+.tgl-btn::-moz-selection,
.checkbox-wrapper-7 .tgl::selection,
.checkbox-wrapper-7 .tgl:after::selection,
.checkbox-wrapper-7 .tgl:before::selection,
.checkbox-wrapper-7 .tgl *::selection,
.checkbox-wrapper-7 .tgl *:after::selection,
.checkbox-wrapper-7 .tgl *:before::selection,
.checkbox-wrapper-7 .tgl+.tgl-btn::selection {
  background: none;
}

.checkbox-wrapper-7 .tgl+.tgl-btn {
  outline: 0;
  display: block;
  width: 4em;
  height: 2em;
  position: relative;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.checkbox-wrapper-7 .tgl+.tgl-btn:after,
.checkbox-wrapper-7 .tgl+.tgl-btn:before {
  position: relative;
  display: block;
  content: "";
  width: 50%;
  height: 100%;
}

.checkbox-wrapper-7 .tgl+.tgl-btn:after {
  left: 0;
}

.checkbox-wrapper-7 .tgl+.tgl-btn:before {
  display: none;
}

.checkbox-wrapper-7 .tgl:checked+.tgl-btn:after {
  left: 50%;
  background-color: #fff;
}

.checkbox-wrapper-7 .tgl-ios+.tgl-btn {
  background: #fbfbfb;
  border-radius: 2em;
  padding: 2px;
  transition: all 0.4s ease;
  border: 1px solid #e8eae9;
}

.checkbox-wrapper-7 .tgl-ios+.tgl-btn:after {
  border-radius: 2em;
  background: #87c33e;
  transition: left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), padding 0.3s ease, margin 0.3s ease;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 4px 0 rgba(0, 0, 0, 0.08);
}

.checkbox-wrapper-7 .tgl-ios+.tgl-btn:hover:after {
  will-change: padding;
}

.checkbox-wrapper-7 .tgl-ios+.tgl-btn:active {
  box-shadow: inset 0 0 0 2em #e8eae9;
}

.checkbox-wrapper-7 .tgl-ios+.tgl-btn:active:after {
  padding-right: 0.8em;
}

.checkbox-wrapper-7 .tgl-ios:checked+.tgl-btn {
  background: #87c33e;
}

.checkbox-wrapper-7 .tgl-ios:checked+.tgl-btn:active {
  box-shadow: none;
}

.checkbox-wrapper-7 .tgl-ios:checked+.tgl-btn:active:after {
  margin-left: -0.8em;
}



/* Slide tab */

.tabs input {

  visibility: hidden;

  display: none;

}

.buttons {
  position: relative;
  display: flex;
  gap: 80px;
  padding: 30px 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  overflow: hidden;
  justify-content: space-between;
  text-align: center;
}

.buttons label {

  width: 20%;

  font-size: 1.75em;

  -webkit-text-stroke: 1px #fff;

  color: transparent;

  opacity: 0.3;

  cursor: pointer;

  transition: 0.5s;

}

.buttons label:hover {
  opacity: 1;
  filter: drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #fff);
  will-change: filter;
}

.tabs input:nth-child(1):checked~.buttons label:nth-child(1),

.tabs input:nth-child(2):checked~.buttons label:nth-child(2),

.tabs input:nth-child(3):checked~.buttons label:nth-child(3),

.tabs input:nth-child(4):checked~.buttons label:nth-child(4),

.tabs input:nth-child(5):checked~.buttons label:nth-child(5) {
  color: #fff;
  opacity: 1;
  filter: drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #fff);
  will-change: filter;
}

.underline {

  position: absolute;

  left: 0;

  bottom: 0;

  width: 15%;

  height: 5px;

  transition: 0.5s;

}

.underline::before {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 100%;
  background: #fff;
  border-radius: 4px;
  filter: drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #fff) drop-shadow(0 0 30px #fff) drop-shadow(0 0 50px #fff);
  will-change: filter;
}

.underline::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 100%;
  background: #fff;
  border-radius: 4px;
  filter: drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #fff);
  will-change: filter;
}

.active-tab:nth-of-type(1) ~ .underline{
  left:4%;
}
.active-tab:nth-of-type(2) ~ .underline{
  left:29.5%;
}
.active-tab:nth-of-type(3) ~ .underline{
  left:55.1%;
}
.active-tab:nth-of-type(4) ~ .underline{
  left:80.9%;
}
.tabs input:nth-child(1):checked~.buttons .underline {

  left: 51%;
}

.tabs input:nth-child(2):checked~.buttons .underline {

  left: 20%;

}

.tabs input:nth-child(3):checked~.buttons .underline {

  left: 40%;

}

.tabs input:nth-child(4):checked~.buttons .underline {

  left: 60%;

}

.tabs input:nth-child(5):checked~.buttons .underline {

  left: 80%;

}

.main {
  display: flex;
  justify-content: center;
  margin-top: 6px;
  gap: 20px;
  flex-wrap: wrap;
}
/* Za stranice */


.container {
  position: relative;
  width: 100%;
  height: 100%;
  max-height: max-content;
  padding-bottom: 130px;
}

.page.active {
  transform: translateX(0%);
  /* Prikazi aktivnu stranicu */
}

.previous {
  transform: translateX(-100%);
  /* Prikazi prethodnu stranicu ulevo */
}

.page {
  width: 100%;
}

.groups-items {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
}
@media only screen and (max-width: 1200px){
  .lamp{
    width: 40%;
  }
  .activeAll{
    width: 5vw !important;
    height: 6vh !important;
  }
}
@media only screen and (max-width: 900px) {
  .header-group{
    font-size: 25px;
  }
  .activeAll{
    width: 6vw !important;
    height: 6vh !important;
  }
}
@media only screen and (max-width: 760px) {
  .header-group{
    font-size: 20px;
  }
  .group-content{
    width: 90%;
  }
}

@media only screen and (max-width: 600px) {
  .login-form {
    width: 320px;
    height: 470px;
    left: 53%;
  }
  .customToolTip{
    width: 68vw !important;
  }
  .content-conf button{
    padding: 4px 8px !important;
  }
  .header-text{
    font-size:1.5rem !important;
  }
  .remove-group{
    font-size: 20px !important;
  }
  .activeAll{
    width: 4vw !important;
    height: 4vh !important;
  }
  .activeAll svg{
    width: 22px !important;
    height: 22px !important;
  }
  .tooltip{
    transform: translateX(-79%) !important;
    font-size: 12px !important;
  }
  .header-group-content{
    min-height:70px !important;
  }
  .group-content{
    width: 95%;
  }
  .modal-content {
    width: 90vw !important;
  }
  .modal-header{
    font-size: 13px !important;
  }
  .add-group p{
    font-size: 15px !important;
  }
  .shape:first-child {
    background: url("../public/img/android-chrome-192x192.png");
    background-repeat: no-repeat;
    left: -40px;
    top: -80px;
  }
  .header-group{
    font-size: 15px;
    width: 60%;
  }
  .header-group i{
    font-size: 15px !important;
  }
  .activeAll{
    width: 12% !important;
  }
  input.moje:checked~.arrowPravi::after{
    transform:translateY(0%) !important;
  }
  .changeGroupNameBlock{
    margin-right: 7vw;
    gap: 10px !important;
  }
  .header-group-pencil svg{
    width: 20px !important;
    height: 20px !important;
  }
  .changeGroupNameBlock button{
    font-size: 10px !important;
  }
  .changeGroupNameBlock input{
    padding: 7px 10px;
  }
  input{
    font-size:1rem !important;
    padding: 8px;
  }
  .arrowPravi{
    width: 100% !important;
    height: 100% !important;
  }
  .activeAll{
    width: 7vw !important;
    height: 4vh !important;
    border-radius: 0.3em !important;
    box-shadow: none !important;
    border: 1px solid #fff !important;
    position :absolute !important;
    top:10px !important;
    right:10px !important;
    padding: 2px 3px !important;
    margin-right: 0px !important;
  }
  .down-group-items i{
    font-size: 1rem !important;
  }
}

@media only screen and (max-width: 400px) {
  .error-msg,.form-group span{
    font-size:14px !important;
  }
  .customToolTip{
    top:-45px !important;
  }
  .activeAll button{
    padding: 10px 8px !important;
  }
  .activeAll svg{
    width: 100% !important;
    height:100% !important;
  }
  .content-conf{
    flex-wrap: wrap;
    justify-content: center !important;
  }
  .register-form,
  .login-form {
    width: 323px;
  }

  .login-form {
    left: 50%;
    height: max-content;
    max-height: 90vh;
    overflow-x: scroll;
    padding-top: 3rem;
  }
  .login-form h1{
    font-size: 1.5rem;
  }

  .tabs input:nth-child(1):checked~.buttons .underline {
    left: 2%;
  }

  .buttons {
    gap: 10px !important;
    padding: 15px 20px !important;
  }

  .buttons label {
    text-align: center;
  }

  .tabs input:nth-child(1):checked~.buttons label:nth-child(1),
  .tabs input:nth-child(2):checked~.buttons label:nth-child(2),
  .tabs input:nth-child(3):checked~.buttons label:nth-child(3),
  .tabs input:nth-child(4):checked~.buttons label:nth-child(4),
  .tabs input:nth-child(5):checked~.buttons label:nth-child(5) {
    color: transparent;
  }

  .tabs input:nth-child(2):checked~.buttons .underline {
    left: 28%;
  }

  .tabs input:nth-child(3):checked~.buttons .underline {
    left: 52%;
  }

  .tabs input:nth-child(4):checked~.buttons .underline {
    left: 76%;
  }

  .lamp {
    width: 45%;
    overflow: hidden;
  }
  .groups-items p{
      font-size:16px !important;
  }
  .form-group label{
    font-size:14px !important;
  }
  .temperature-block .lamp{
    width: 80%;
  }


  .underline {
    width: 17%;
  }
  .underline::before {
    width: 55%;
    left: 0;
    transform : translateX(0%);
  }
  .login-background{
    padding-top: 60px !important;
  }
  .underline::after {
    width: 50%;
    right:0;
    transform : translateX(0%);
  }

  .active-tab:nth-of-type(1) ~ .underline{
    left:6%;
  }
  .active-tab:nth-of-type(2) ~ .underline{
    left:29.5%;
  }
  .active-tab:nth-of-type(3) ~ .underline {
    left: 53.1%;
  }
  .active-tab:nth-of-type(4) ~ .underline{
    left:76.9%;
  }
  .user-body li{
    font-size: 16px !important;
  }
  .form-button,.modal-footer button{
    font-size:15px !important;
    padding: 6px 9px !important;
  }
}

.block-fixed {
  display: flex;
  justify-content: space-between;
  width: 100%;
  position: fixed;
  bottom: 20px;
}

.block-fixed .lamp{
  background-color: #00293E;
  font-size: 12px;
  width: 40%;
  padding: 10px 0px;
  border:1px solid rgba(255,255,255,0.1);
}

.smooth-fade-enter-active,
.smooth-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.smooth-fade-enter {
  opacity: 1;
  transform: translateX(50%);
}

.smooth-fade-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.smooth-fade-leave {
  opacity: 1;
  transform: translateX(0);
}

.smooth-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%);
}

.color-danger {
  color: rgb(255, 0, 93);
}

.header-text {
  text-align: center;
  font-size: 30px;
  color: #fff;
}

</style>
