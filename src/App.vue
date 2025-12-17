<template>
  <div v-touch:swipe.left="nextPage" v-touch:swipe.right="prevPage" v-if="isOnline" class="login-background">
    <div class="tabs background-block">
      <router-link to="/" exact v-slot="{ isActive }">
        <input id="home" type="radio" name="tabsMenu" :class="{ active: isActive }" />
      </router-link>

      <template v-for="cat in allCategories" :key="cat.id">
        <template v-if="cat.name !== 'Heating' && cat.name !== 'Cooling'">
          <router-link :to="{ name: routeLink(cat), params: { idCategories: cat.id } }" v-slot="{ isActive }">
            <input :id="cat.name" type="radio" name="tabsMenu" :class="{ active: isActive }" />
          </router-link>
        </template>
      </template>
      <router-link :to="{ name: 'Temperature', }" v-slot="{ isActive }">
        <input id="temperature" type="radio" name="tabsMenu" :class="{ active: isActive }" />
      </router-link>

      <div class="buttons" ref="buttonsContainer">
        <div class="menu-block">
          <!-- <div class="logo-block">
            <img src="img/logo.png" alt="logo" />
          </div> -->

        </div>
        <label for="home" :class="{ 'active-tab': isActive('/') }">
          <Icon icon="tabler:home" width="32" height="32" />
        </label>
        <template v-if="allCategories">
          <template v-for="cat in allCategories" :key="cat.id">
            <template v-if="cat.name !== 'Heating' && cat.name !== 'Cooling'">

              <label :for="cat.name" :class="{ 'active-tab': isActive('/' + cat.name) }"><i :class="cat.icon"
                  :ref="el => setTabRef(el, cat.name)"></i></label>
            </template>
          </template>
          <label for="temperature" :class="{ 'active-tab': isActive('/temperature') }"><i
              class="fa-regular fa-snowflake"></i></label>

          <!-- Dynamic underline -->
          <div class="underline" ref="underline" :style="underlineStyle">
          </div>
        </template>
        <template v-else>
          <Skeleton size="3rem"></Skeleton>
          <Skeleton size="3rem"></Skeleton>
          <Skeleton size="3rem"></Skeleton>
        </template>
      </div>
    </div>

    <div class="main-moj container">
      <div v-if="isLoading" class="loading-overlay">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s"
          aria-label="Custom ProgressSpinner"></ProgressSpinner>
      </div>
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" :key="route.path" class="view" />
        </transition>
      </router-view>
    </div>

    <div class="block-fixed with-circles">
      <div @click="showTimerModal()" class="lamp background-block">
        <PhAlarm :size="32" />
        <p>Tajmer</p>
      </div>
      <div @click="handlePlusClick()" class="plus-button">
      </div>
      <div @click="showUserModal()" class="lamp background-block">
        <PhUser :size="32" />
        <p>Korisnički profil</p>
      </div>
      <div @click="showMenu()" class="lamp background-block">
        <PhList :size="32" />
      </div>
    </div>

    <modal-layout v-model:currentStepIndexProps="stepIndex" :steps="components" :visible="isOpen"
      :modalContent="modalContent" @close="closeModal()" @changeForms="handleFormChange" @finish="handleFinish"
      @getDatas="handleGetDatas">
      <template v-if="isTimerModal && components.length > 1" #steps="{ nextStep, hasNext, previousStep }">
        <div class="modal-footer">
          <ButtonMy variant="glass" v-if="hasNext()" @click="nextStep()" class="form-button">Lista tajmera
            <template #icon>
              <Icon icon="bi:list-ol" width="22" height="22" />
            </template>
          </ButtonMy>
          <ButtonMy variant="glass" v-else @click="previousStep()" class="form-button">Dodaj tajmer
            <template #icon>
              <Icon icon="mdi:timer-plus" width="22" height="22" />
            </template>
          </ButtonMy>
        </div>
      </template>
    </modal-layout>

    <transition name="slide-right-my">
      <div v-if="isShowMenu" class="overlayer" @click.stop="closeMenu()">
        <div class="side-menu" @click.stop>
          <div class="close-menu-button">
            <span @click="closeMenu()">
              <PhX size="32" />
            </span>
          </div>
          <div class="mini-header">
            <small>
              <PhList :size="12" />Podešavanja
            </small>
          </div>
          <ul>
            <li @click="showModalForDeleteDevices()">
              <PhTrash :size="22" /> Obriši uređaje
            </li>
            <li @click="showModalForListOfTermostat()" class="none-border">
              <PhListNumbers :size="22" /> Lista termostata
            </li>
            <li>
              <PhSliders :size="22" /> Dodatna podešavanja
            </li>
            <li>
              <PushNotification />
            </li>
          </ul>
        </div>
      </div>
    </transition>


  </div>
  <div v-else>
    <OfflineView />
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import modalLayout from '@/components/modalLayout.vue';
import OfflineView from '@/views/OfflineView.vue';
import { ref, onMounted, computed, onUnmounted, watch, onBeforeUnmount, nextTick } from 'vue';
import Skeleton from 'primevue/skeleton';
const isOpen = computed(() => modalState.value.isOpen);
const components = computed(() => modalState.value.components);
const modalContent = computed(() => modalState.value.content);
import store from '@/store';
const isShowMenu = ref(false);

import { PhAlarm, PhList, PhListNumbers, PhSliders, PhTrash, PhUser, PhX } from "@phosphor-icons/vue";
import { useToast } from "vue-toastification";
import { useModalFlow } from './composables/useModalFlow';
import { ProgressSpinner } from 'primevue';
import { Icon } from '@iconify/vue';
import PushNotification from './components/ui/PushNotification.vue';

const toast = useToast();
const stepIndex = computed({
  get: () => modalState.value.currentStep,
  set: (value) => modalState.value.currentStep = value
});
const route = useRoute();
const router = useRouter();

const hasActiveOverlay = computed(() => {
  return isOpen.value || isShowMenu.value;
});

// Kombinovani loading flag iz oba store modula
const isLoading = computed(() => {
  return store.getters['device/isLoading'] || store.getters['group/isLoading'];
});

const routeOrder = ref({
  '/': 0,
  '/light/1': 1,
  '/plug/2': 2,
  '/temperature': 3
});


const {
  modalState,
  isTimerModal,
  openTimerModal,
  openDeviceGroupModal,
  openUserModal,
  openDeleteDevicesModal,
  openListOfTermostatModal,
  updateFormData,
  changeComponents,
  finishModal,
  closeModal
} = useModalFlow();

const formData = ref([]);


const isOnline = ref(navigator.onLine); // Trenutni status interneta
const isOfflinePending = ref(false); // Flag za praćenje odlaganja offline moda
let offlineTimeout = null; // Reference za timeout funkciju
let alreadyFetched = false;


const buttonsContainer = ref(null);
const underline = ref(null);
const tabRefs = ref({});
const underlineStyle = ref({
  left: '0px',
  width: '0px'
})

const setTabRef = (el, name) => {
  if (el) {
    tabRefs.value[name] = el;
  }
};

const updateOnlineStatus = () => {
  if (navigator.onLine) {
    isOnline.value = true;
    isOfflinePending.value = false;
    clearTimeout(offlineTimeout); // Ukloni aktivan timeout ako postoji
  } else {
    isOfflinePending.value = true;
    offlineTimeout = setTimeout(() => {
      isOnline.value = false; // Postavi status na offline tek nakon 2 minuta
      isOfflinePending.value = false; // Resetuj odlaganje jer je sada stvarno offline
    }, 60000); // 60000 ms = 1 minut
  }
};
const showModalForDeleteDevices = openDeleteDevicesModal;
const showModalForListOfTermostat = openListOfTermostatModal;
const allCategories = computed(() => {
  const categories = store.getters['category/getListOfCategories'];
  if (!categories) return [];

  return categories.map(cat => ({
    ...cat,
    displayName: getCategoryDisplayName(cat.name)
  }));
});

watch(() => allCategories.value, () => {
  nextTick(() => {
    updateUnderline();
  });
}, { deep: true });


const getCategoryDisplayName = (categoryName) => {
  const nameMap = {
    'Light': 'Uređaji za osvetljenje',
    'Cooling': 'Uređaji za hlađenje',
    'Heating': 'Uređaji za grejanje'
  };
  return nameMap[categoryName] || categoryName;
};

const showMenu = () => {
  isShowMenu.value = true;
}
const closeMenu = () => {
  isShowMenu.value = false;
}
const handlePlusClick = openDeviceGroupModal;

const handleFormChange = changeComponents

const handleFinish = async () => {
  // Proverite koji tip modala je aktivan i rukujte accordingly
  if (isTimerModal.value) {
    // Logika za timer modal finish
    console.log('Timer modal finished');
    closeModal();
  } else {
    // Logika za group/device modal finish
    await handleGroupDeviceFinish(modalState.value.formData);
  }
};

const handleGroupDeviceFinish = async (localDataFromModal = null) => {
  let groupData, deviceData;
  if (localDataFromModal && localDataFromModal.length > 0) {
    groupData = localDataFromModal[0];
    deviceData = localDataFromModal[1];
  } else {
    groupData = modalState.value.formData.get(0) || modalState.value.components.value[0]?.props?.previousValue;
    deviceData = modalState.value.formData.get(1) || modalState.value.components.value[1]?.props?.previousValue;
  }

  const data = {
    name: groupData?.grupaUredjaja || groupData?.name,
    ids: deviceData?.devices || deviceData?.selectedDevices || []
  };

  console.log('Final data to send:', data);

  if (!data.name) {
    toast.error("Ime grupe je obavezno!", { timeout: 3000 });
    return;
  }

  try {
    await store.dispatch('group/addGroup', data);
    closeModal();
    toast.success("Uspešno sačuvano!", {
      timeout: 3000
    });
  } catch (error) {
    toast.error(error.message, {
      timeout: 3000
    });
  }
};

const handleGetDatas = (data) => {
  if (data.step !== undefined) {
    updateFormData(data.step - 1, data);
  }
};


const getAllCategories = async () => {
  await store.dispatch("category/getAll");
}

function isActive(path) {
  const currentPath = route.path.toLowerCase();
  const targetPath = path.toLowerCase();

  if (targetPath === "/") {
    return currentPath === "/";
  }

  return currentPath.startsWith(targetPath);
}

const showTimerModal = openTimerModal;

async function fetchItems() {
  try {
    const results = await Promise.allSettled([
      store.dispatch('group/getAllGroup'),
      store.dispatch('device/getAllDevices')
    ]);

    const [groupsResult, devicesResult] = results;

    if (groupsResult.status === 'rejected') {
      toast.error('Nije moguće učitati grupe', { timeout: 2000 });
    }

    if (devicesResult.status === 'rejected') {
      toast.error('Nije moguće učitati uređaje', { timeout: 2000 });
    }

    if (groupsResult.status === 'rejected' && devicesResult.status === 'rejected') {
      toast.error('Greška prilikom učitavanja podataka', { timeout: 3000 });
    }
  } catch (error) {
    toast.error('Greška: ' + error.message, { timeout: 3000 });
  }
}

watch(() => store.state.user.user, (newUser, oldUser) => {
  if (!newUser && oldUser) {
    alreadyFetched = false;
  }
  else if (newUser && (!oldUser || newUser.id !== oldUser.id)) {
    alreadyFetched = false;
    if (newUser) {
      loadData();
    }
  }
})


const updateUnderline = async () => {
  await nextTick();

  // Pronađi aktivni tab
  const activeTab = buttonsContainer.value?.querySelector('.active-tab');
  console.log(activeTab);
  if (!activeTab || !buttonsContainer.value) return;

  // Dobij poziciju container-a
  const containerRect = buttonsContainer.value.getBoundingClientRect();

  // Dobij poziciju aktivnog tab-a
  const activeRect = activeTab.getBoundingClientRect();

  // Izračunaj poziciju relativno na container
  const left = activeRect.left - containerRect.left;
  const width = activeRect.width;

  // Postavi stil
  underlineStyle.value = {
    left: `${left}px`,
    width: `${width}px`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };
};

// watch(() => route.fullPath, () => {
// }, { immediate: true });

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateUnderline);
});

const showUserModal = openUserModal;

onMounted(async () => {
  if (localStorage.getItem('token')) {
    await loadData();
  }

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  // Socket implementacija
  window.Echo.channel('devices')
    .listen('.status-updated', (e) => {
      store.dispatch('device/changeStatusOfDeviceWithSocket', e.device);
    });
})

async function loadData() {
  if (alreadyFetched) return;
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No token found, user not logged in');
    return;
  }
  console.log("Doslioiii")
  alreadyFetched = true;
  try {
    await getAllCategories();
    await fetchItems();
  } catch (e) {
    alreadyFetched = false;
    toast.error("Greska prilikom ucitavanja: " + e, { timeout: 2000 });
  }
}

onUnmounted(() => {
  window.removeEventListener("online", updateOnlineStatus);
  window.removeEventListener("offline", updateOnlineStatus);

  if (offlineTimeout) clearTimeout(offlineTimeout);

  formData.value = [];
  // Očisti timeout ako postoji
  if (offlineTimeout) {
    clearTimeout(offlineTimeout);
  }
});

const routeLink = (cat) => {
  return cat.name === 'Heating/Cooling' ? 'Temperature' : cat.name
}

const nextPage = () => {
  if (hasActiveOverlay.value) {
    return;
  }
  const currentPath = router.currentRoute.value.path;
  if (currentPath === '/') {
    router.push('/light/1');
  } else if (currentPath === '/light/1') {
    router.push('/plug/2');
  }
  else if (currentPath === '/plug/2') {
    router.push('/temperature');
  }
};




const prevPage = () => {
  if (hasActiveOverlay.value) {
    return;
  }
  const currentPath = router.currentRoute.value.path;
  if (currentPath === '/temperature') {
    router.push('/plug/2');
  } else if (currentPath === '/plug/2') {
    router.push('/light/1');
  }
  else if (currentPath === '/light/1') {
    router.push('/');
  }
}





const transitionName = ref('slide-left');
let previousIndex = routeOrder[route.path] ?? 0

watch(() => route.path, (newPath) => {
  if (hasActiveOverlay.value) {
    return;
  }
  const newIndex = routeOrder[newPath] ?? 0;

  if (newIndex > previousIndex) {
    transitionName.value = 'slide-left'
  } else {
    transitionName.value = 'slide-right'
  }

  previousIndex = newIndex;
});


watch(
  () => route.fullPath,
  async (newPath) => {
    if (Object.keys(routeOrder).includes(newPath)) {
      await loadData();
    }
    updateUnderline();
  },
  { immediate: true }
);

</script>

<style>
:root {
  --scrollbar-bg: rgba(0, 41, 62, 0.8);
  --scrollbar-track: rgba(0, 41, 62, 0.1);
  --p-multiselect-option-focus-background: transparent;
  --p-multiselect-option-focus-color: #333;
}

input::placeholder {
  color: white !important;
}

* {
  margin: 0px;
  padding: 0px;
  box-sizing: border-box;
  font-family: "Inter", sans-serif;
}

.logo-block {
  width: 30%;
}

.logo-block img {
  max-width: 100%;
}

.w-100 {
  width: 100%;
}

.menu-block {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.menu-item {
  cursor: pointer;
}


.p-dialog-mask {
  z-index: 1102 !important;
}

.Vue-Toastification__container {
  z-index: 100000 !important;
}

.p-datepicker-panel {
  background-color: #00293E !important;
  z-index: 9999 !important;
}

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
}

* {
  color: #fff;
}

.lamp.offline p,
.lamp.offline strong,
.lamp.offline svg {
  color: #d32f2f !important;
}

.p-multiselect-overlay {
  background-color: #00293E !important;
}


.p-dialog {
  background-color: #00293E !important;
}

.p-multiselect {
  background-color: #00293E !important;
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

.form-group span {
  color: #DC2626;
}

.close-button {
  overflow: hidden;
  position: relative;
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

.close-button:focus {
  outline: solid 0 transparent;
  box-shadow: 0 0 0 2px #8ed0f9
}

.close-button:hover {
  background: rgba(29, 161, 142, .1)
}

.tabs {
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 2;
  background-color: transparent;
}

.tabs .buttons {
  border-radius: 0px 0px 20px 20px;
}

.tabs.background-block {
  border: none;
  background-color: transparent;
}

.close-button:before,
.close-button:after {
  position: absolute;
  top: 15%;
  left: calc(50% - .0625em);
  width: .125em;
  height: 70%;
  border-radius: .125em;
  transform: rotate(45deg);
  background: currentcolor;
  content: ''
}

.close-button:after {
  transform: rotate(-45deg);
}

.activeAll {
  width: 4vw;
  height: 4vh;
  border-radius: 0.3em !important;
  box-shadow: none !important;
  border: 1px solid #fff !important;
  position: absolute !important;
  top: 10px !important;
  right: 10px !important;
  padding: 2px 3px !important;
  margin-right: 0px !important;
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
  /* filter: drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #fff); */
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
  /* filter: drop-shadow(0px 0px 0px transparent); */
  will-change: filter;
}

.lamp.active i:not(:last-child) {
  /* filter: drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #fff); */
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
  /* padding-top: 20px; */
  cursor: pointer;
  transition: all 300ms;
  border: 1px solid transparent;
  color: #fff;
  position: relative;
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

.slide-right-my-enter-active,
.slide-right-my-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-my-enter-active .side-menu::before,
.slide-right-my-leave-active .side-menu::before {
  transition: transform 0.2s ease;
}

.close-menu-button {
  width: max-content;
  margin: 20px 0px;
  margin-left: 10px;
}

.slide-right-my-enter-from {
  transform: translateX(-100%);
}

.slide-right-my-enter-to {
  transform: translateX(0%);
}

.slide-right-my-leave-from {
  transform: translateX(0%);
}

.slide-right-my-leave-to {
  transform: translateX(-100%);
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
}

.lamp:hover {
  border: 1px solid #fff;
}

.login-background {
  min-height: 100vh;
  background-color: #00293E;
  padding-top: 20vh;
  scroll-behavior: auto;
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
  /* background: url("../public/img/android-chrome-192x192.png"); */
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
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

}

.login-form,
.register-form {
  height: max-content;
  width: 700px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 40px rgba(8, 7, 16, 0.6);
  padding: 50px 35px;
  z-index: 2;
}

.login-form *,
.register-form * {
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
  flex-wrap: wrap;
  background: rgba(0, 41, 62, 0.8);
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
}

.tabs input:nth-child(1):checked~.buttons label:nth-child(1),

.tabs input:nth-child(2):checked~.buttons label:nth-child(2),

.tabs input:nth-child(3):checked~.buttons label:nth-child(3),

.tabs input:nth-child(4):checked~.buttons label:nth-child(4),

.tabs input:nth-child(5):checked~.buttons label:nth-child(5) {
  color: #fff;
  opacity: 1;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
}

.underline {
  position: absolute;
  bottom: 0;
  height: 4px;
  background: transparent;
  pointer-events: none;
  z-index: 0;
}

.underline::before {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 100%;
  background: #fff;
  border-radius: 4px;
  box-shadow:
    0 0 10px rgba(255, 255, 255, 0.8),
    0 0 20px rgba(255, 255, 255, 0.6),
    0 0 30px rgba(255, 255, 255, 0.4);
}

.underline::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 100%;
  background: #fff;
  border-radius: 4px;
  box-shadow:
    0 0 10px rgba(255, 255, 255, 0.8),
    0 0 20px rgba(255, 255, 255, 0.6),
    0 0 30px rgba(255, 255, 255, 0.4);
  /* filter: blur(5px); */
  /* opacity: 0.5; */
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

.overlayer {
  content: '';
  position: fixed;
  display: block;
  top: 0;
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  width: 100%;
  z-index: 1100;
}

.side-menu {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  background-color: #ffff;
  width: 55%;
  color: black !important;
  z-index: 1101;
  padding-top: 3%;
  border-right: 1px solid black;
  /* transform: translateX(0%);
  transition: all 400ms ease-in-out; */
}

.mini-header small {
  display: flex;
  align-items: center;
  gap: 5px;
  color: gray;
  font-size: 0.8rem;
  margin-left: 5px;
  margin-top: 10px;
}

.none-border {
  border: none !important;
}

.side-menu ul {
  margin-top: 20px;
}

.side-menu ul li {
  font-size: 1rem;
  display: flex;
  gap: 10px;
  align-items: center;
  width: max-content;
  cursor: pointer;
  border-top: 1px solid rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(0, 0, 0, 0.5);
  width: 100%;
  padding: 15px 5px;
}

@media (max-width: 768px) and (max-device-pixel-ratio: 2) {

  .buttons label:hover,
  .lamp.active i:not(:last-child),
  .underline::before,
  .underline::after {
    filter: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  .block-fixed {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: rgba(255, 255, 255, 0.95);
  }

  * {
    transition-duration: 0.2s !important;
  }
}

@media (max-width: 1293px) {
  .buttons label {
    width: 19% !important;
  }
}

@media (max-width: 1094px) {
  .buttons {
    gap: 50px !important;
  }

  .buttons label {
    width: 18% !important;
  }
}

@media only screen and (max-width: 1200px) {
  .lamp {
    width: 40%;
  }

  .activeAll {
    width: 5vw !important;
    height: 6vh !important;
  }
}

@media only screen and (max-width: 900px) {
  .header-group {
    font-size: 25px;
  }

  .activeAll {
    width: 6vw !important;
    height: 6vh !important;
  }
}

@media only screen and (max-width: 760px) {
  .header-group {
    font-size: 20px;
  }

  .group-content {
    width: 90%;
  }
}

@media only screen and (max-width: 700px) {
  .buttons label {
    width: 18% !important;
  }

  .buttons {
    gap: 10px !important;
    padding: 30px 20px !important;
    padding-top: 20px !important;
  }
}

@media only screen and (max-width: 600px) {
  .login-form {
    width: 320px;
    /* height: 470px; */
    left: 53%;
  }


  .customToolTip {
    width: 68vw !important;
  }

  .content-conf button {
    padding: 4px 8px !important;
  }

  .header-text {
    font-size: 1.5rem !important;
  }

  .remove-group {
    font-size: 20px !important;
  }

  .activeAll {
    width: 4vw !important;
    height: 4vh !important;
  }

  .activeAll svg {
    width: 22px !important;
    height: 22px !important;
  }

  .tooltip {
    transform: translateX(-79%) !important;
    font-size: 12px !important;
  }

  .header-group-content {
    min-height: 70px !important;
  }

  .group-content {
    width: 95%;
  }

  .modal-content {
    width: 90vw !important;
  }

  .modal-header {
    font-size: 13px !important;
  }

  .add-group p {
    font-size: 15px !important;
  }

  .shape:first-child {
    /* background: url("../public/img/android-chrome-192x192.png"); */
    background-repeat: no-repeat;
    left: -40px;
    top: -80px;
  }

  .header-group {
    font-size: 18px;
    width: 60%;
  }

  .header-group i {
    font-size: 15px !important;
  }

  .activeAll {
    width: 15% !important;
  }

  input.moje:checked~.arrowPravi::after {
    transform: translateY(0%) !important;
  }

  .changeGroupNameBlock {
    margin-right: 7vw;
    gap: 10px !important;
  }

  .header-group-pencil svg {
    width: 20px !important;
    height: 20px !important;
  }

  .changeGroupNameBlock button {
    font-size: 10px !important;
  }

  .changeGroupNameBlock input {
    padding: 7px 10px;
  }

  input {
    font-size: 1rem !important;
    padding: 8px;
  }

  .arrowPravi {
    width: 100% !important;
    height: 100% !important;
  }


  .down-group-items i {
    font-size: 1rem !important;
  }
}

@media only screen and (max-width: 400px) {

  .error-msg,
  .form-group span {
    font-size: 14px !important;
  }

  .customToolTip {
    top: -45px !important;
  }

  .activeAll button {
    padding: 10px 8px !important;
  }

  .activeAll svg {
    width: 80% !important;
    height: 80% !important;
  }

  .content-conf {
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

  .login-form h1 {
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
    width: 40%;
    overflow: hidden;
  }

  .lamp p {
    margin-top: 0px !important;
  }

  .lamp .name-block {
    padding-bottom: 5px !important;
  }

  .groups-items p {
    font-size: 16px !important;
  }

  .temperature-block .lamp {
    width: 80%;
  }


  .underline {
    width: 17%;
  }

  .underline::before {
    width: 55%;
    left: 0;
    transform: translateX(0%);
  }

  .login-background {
    padding-top: 19vh !important;
  }

  .underline::after {
    width: 50%;
    right: 0;
    transform: translateX(0%);
  }

  .active-tab:nth-of-type(1)~.underline {
    left: 6%;
  }

  .active-tab:nth-of-type(2)~.underline {
    left: 29.5%;
  }

  .active-tab:nth-of-type(3)~.underline {
    left: 53.1%;
  }

  .active-tab:nth-of-type(4)~.underline {
    left: 76.9%;
  }

  .user-body li {
    font-size: 16px !important;
  }

  .form-button,
  .modal-footer button {
    font-size: 15px !important;
    padding: 6px 9px !important;
  }
}

.block-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 41, 62, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 12px 20px 28px 20px;
  /* Extra padding bottom for iPhone safe area */
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

.block-fixed .lamp {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 16px;
  background: transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 60px;
  position: relative;
}

.block-fixed .lamp:hover,
.block-fixed .lamp:active {
  background: rgba(0, 123, 255, 0.1);
  transform: translateY(-2px);
}

.block-fixed .lamp svg {
  color: #666;
  transition: all 0.3s ease;
  margin-bottom: 4px;
}

.block-fixed .lamp:hover svg,
.block-fixed .lamp:active svg {
  color: #007bff;
  transform: scale(1.1);
}

.block-fixed .lamp p {
  font-size: 11px;
  font-weight: 500;
  color: #666;
  margin: 0;
  text-align: center;
  transition: color 0.3s ease;
  line-height: 1.2;
}

.block-fixed .lamp:hover p,
.block-fixed .lamp:active p {
  color: #007bff;
}

/* Dark theme support */
  /* .block-fixed {
    background: #00293E;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  } */

  .side-menu {
    background-color: #00293E;
  }

  .block-fixed .lamp:hover,
  .block-fixed .lamp:active {
    background: rgba(255, 159, 10, 0.15);
  }

  .block-fixed .lamp svg {
    color: #999;
  }

  .block-fixed .lamp:hover svg,
  .block-fixed .lamp:active svg {
    color: #ff9f0a;
  }

  .block-fixed .lamp p {
    color: #999;
  }

  .block-fixed .lamp:hover p,
  .block-fixed .lamp:active p {
    color: #ff9f0a;
  }

  .block-fixed .plus-button {
    /* background: linear-gradient(135deg, #ff9500, #ffb347); */
    /* box-shadow: 0 4px 20px rgba(255, 149, 0, 0.4); */
    /* border: 3px solid rgba(28, 28, 30, 0.9); */
  }

  .block-fixed .plus-button:hover {
    box-shadow: 0 6px 25px rgba(255, 149, 0, 0.5);
  }

  .p-togglebutton-checked .p-togglebutton-content {
    background-color: #00293E !important;
  }

/* Add safe area for iOS devices */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .block-fixed {
    padding-bottom: calc(18px + env(safe-area-inset-bottom));
  }
}

.block-fixed.with-circles .lamp {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(0, 123, 255, 0.1);
  /* backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px); */
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.block-fixed.with-circles .lamp:hover,
.block-fixed.with-circles .lamp:active {
  background: rgba(0, 123, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.block-fixed.with-circles .lamp p {
  position: absolute;
  bottom: -20px;
  font-size: 10px;
  white-space: nowrap;
}

.block-fixed .plus-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #00293E;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  border-top: 3px solid rgba(255, 255, 255, 0.1);
  ;
  position: absolute;
  top: -31px;
  margin: 0 8px;
}

.block-fixed .plus-button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 25px rgba(255, 107, 53, 0.5);
}

.block-fixed .plus-button:active {
  transform: translateY(-1px) scale(0.98);
}

.block-fixed .plus-button svg {
  color: white;
  font-size: 24px;
}

.block-fixed .plus-button::before {
  content: '+';
  color: white;
  font-size: 28px;
  font-weight: 300;
  line-height: 1;
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


.lamp.background-block {
  contain: layout style paint;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.lamp.background-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.lamp.active {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.lamp.active:hover {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
}

.lamp.offline {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border: 1px solid #f44336;
  color: #d32f2f;
}

.p-multiselect-overlay {
  z-index: 10000 !important;
}

.p-multiselect-overlay .p-focus {
  background: transparent !important;
  color: inherit !important;
}

/* Moderni dugmad */
.modern-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.modern-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.modern-button:hover::before {
  left: 100%;
}

.modern-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.modern-button:active {
  transform: translateY(0);
}

/* Specifični stilovi za dugmad u content-conf */
.content-conf {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
}

.content-conf button {
  flex: 1;
  border: none;
  border-radius: 12px;
  padding: 14px 12px;
  margin-bottom: 4px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.content-conf button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: left 0.5s;
}

.content-conf button:hover::before {
  left: 100%;
}

/* Delete button */
.content-conf button:nth-child(1) {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
}

.content-conf button:nth-child(1):hover {
  background: linear-gradient(135deg, #ee5a52 0%, #e74c3c 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

/* Edit button */
.content-conf button:nth-child(2) {
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  color: white;
}

.content-conf button:nth-child(2):hover {
  background: linear-gradient(135deg, #40c057 0%, #37b24d 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(81, 207, 102, 0.4);
}

/* Settings button */
.content-conf button:nth-child(3) {
  background: linear-gradient(135deg, #74c0fc 0%, #339af0 100%);
  color: white;
}

.content-conf button:nth-child(3):hover {
  background: linear-gradient(135deg, #339af0 0%, #228be6 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(116, 192, 252, 0.4);
}

/* Down button */
.down-button {
  width: 100%;
  color: inherit;
  padding: 12px 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* backdrop-filter: blur(15px); */
}



.down-button i {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.rotate {
  transform: rotate(180deg);
}

/* Color button */
.color-button {
  background: linear-gradient(135deg, #87c33e 0%, #6da62c 100%) !important;
  border: none;
  border-radius: 8px;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(135, 195, 62, 0.3);
}

.color-button:hover {
  background: linear-gradient(135deg, #6da62c 0%, #5e8f26 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(135, 195, 62, 0.4);
}

/* Form input sa modernim stilom */
.form-change-input {
  padding-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-change-input input {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  color: inherit;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-change-input input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-change-input button {
  width: auto;
  padding: 10px 12px;
  margin: 0;
}

/* Responzivne ikonice */
.content-up i {
  font-size: 48px;
  transition: all 0.3s ease;
}

.name-block {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding-bottom: 20px;
}

.name-block p {
  font-weight: 600;
  font-size: 16px;
  margin: 0;
}

.outOfRange {
  text-align: center;
}

.outOfRange p {
  color: #d32f2f;
  margin: 8px 0;
}

.outOfRange p:first-child {
  font-weight: 600;
  font-size: 16px;
}

.outOfRange p:last-child {
  margin-top: 16px;
}

/* Loading spinner container */
.content-up {
  min-height: 6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.isToggling {
  position: relative;
}

.isToggling::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  z-index: 10;
}

/* Slide down animacija */
.slidedown-enter-active,
.slidedown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top;
}

.slidedown-enter-from,
.slidedown-leave-to {
  opacity: 0;
  transform: scaleY(0);
}

.slidedown-enter-to,
.slidedown-leave-from {
  opacity: 1;
  transform: scaleY(1);
}

/* Responzivni stilovi */
@media (max-width: 600px) {

  /* Smanjene ikonice na mobilnim uređajima */
  .content-up i {
    font-size: 32px;
  }

  /* PhPlugs i PhPlugsConnected komponente */
  .content-up svg {
    width: 32px !important;
    height: 32px !important;
  }

  .name-block p {
    font-size: 14px;
  }

  .content-conf button {
    padding: 10px 8px;
    font-size: 14px;
  }

  .content-conf i {
    font-size: 16px;
  }

  .down-button {
    padding: 8px 0;
  }

  .down-button i {
    font-size: 12px;
  }

  .lamp.background-block {
    border-radius: 12px;
  }

  .group-items .lamp.background-block {
    height: 171px !important;
  }

  .form-change-input input {
    font-size: 12px;
    padding: 8px 12px;
  }

  .outOfRange p:first-child {
    font-size: 14px;
  }

  /* Smanjene ikonice u outOfRange */
  .outOfRange svg {
    width: 24px !important;
    height: 24px !important;
  }

  /* Tooltip responsive */
  .info-tooltip {
    font-size: 12px;
  }
}

@media screen and (max-width: 768px) and (-webkit-max-device-pixel-ratio: 2) {

  .modern-button,
  .content-conf button,
  .color-button {
    background: solid colors !important;
    background-image: none !important;
  }

  /* Jednostavnije hover efekte */
  .lamp:hover,
  .modern-button:hover {
    transform: none !important;
    box-shadow: none !important;
  }
}

@media (max-width: 480px) {
  .content-up i {
    font-size: 28px;
  }

  .content-up svg {
    width: 28px !important;
    height: 28px !important;
  }

  .content-conf {
    gap: 8px;
  }

  .content-conf button {
    padding: 8px 6px;
  }
}
</style>
