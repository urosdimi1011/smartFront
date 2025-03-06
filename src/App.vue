<template>
  <!-- {{ allCategories }} -->
  <div class="login-background">
    <div class="tabs background-block">
      <router-link to="/" exact v-slot="{ isActive }">
        <input id="home" type="radio" name="tabsMenu" :class="{ active: isActive }" checked />
      </router-link>
      <!-- <template v-for="cat in allCategories"> -->
      <router-link v-for="cat in allCategories" :key="cat.id"
        :to="{ name: routeLink(cat), params: { idCategories: cat.id } }" v-slot="{ isActive }">
        <input :id="cat.name" type="radio" name="tabsMenu" :class="{ active: isActive }" />
      </router-link>
      <!-- </template> -->
      <!-- <router-link to="/light" v-slot="{ isActive }">
        <input id="light" type="radio" name="tabsMenu" :class="{ active: isActive }" />
      </router-link>
      <router-link to="/temperature" v-slot="{ isActive }">
        <input id="temperature" type="radio" name="tabsMenu" :class="{ active: isActive }" />
      </router-link> -->

      <div class="buttons">
        <label for="home" :class="{ 'active-tab': isActive('/') }"><i class="fa-solid fa-house"></i></label>
        <template v-if="allCategories">
          <label v-for="cat in allCategories" :key="cat.id" :for="cat.name"
            :class="{ 'active-tab': isActive('/' + cat.name === '/Heating/Cooling' ? '/temperature' : '/' + cat.name) }"><i
              :class="cat.icon"></i></label>
        </template>
        <template v-else>
          <Skeleton size="3rem"></Skeleton>
          <Skeleton size="3rem"></Skeleton>
          <Skeleton size="3rem"></Skeleton>
        </template>

        <!-- <label for="light" :class="{ 'active-tab': isActive('/light') }"><i class="fa-regular fa-lightbulb"></i></label>
        <label for="temperature" :class="{ 'active-tab': isActive('/temperature') }">
          <i class="fa-solid fa-plug"></i>
        </label> -->
        <!-- <i class="fa-solid fa-gear"></i></label> -->
        <!-- <div class="underline"></div> -->
      </div>
    </div>

    <div class="main-moj container">

      <router-view :key="$route.fullPath" v-slot="{ Component }">
        <transition name="smooth-fade" mode="out-in">
          <component :is="Component" v-if="Component" />
        </transition>
      </router-view>
    </div>



    <div class="block-fixed">
      <div @click="showTimerModal()" class="lamp background-block">
        <i class="fa-regular fa-clock"></i>
        <p>Tajmer</p>
      </div>
      <div @click="showUserModal()" class="lamp background-block">
        <i class="fa-solid fa-user"></i>
        <p>Korisnicki profil</p>
      </div>
    </div>


    <modal-layout v-model:currentStepIndexProps="stepIndex" :steps="components" :visible="isOpen" @close="close()">
      <!-- <template #body>
        <TimerView @close="close()" />
      </template> -->
      <!-- {{ a.currentStepIndex }} -->
      <template v-if="components.length > 1" #steps="{ nextStep, hasNext, previousStep }">
        <ButtonMy v-if="hasNext()" @click="nextStep()" class="form-button">Pogledaj listu dodatih tajmera </ButtonMy>
        <ButtonMy v-else @click="previousStep()" class="form-button">Vrati se na dodavanje tajmera </ButtonMy>
      </template>
      <!-- <template></template> -->
    </modal-layout>
    <!-- <modal-layout :visible="isOpen" @close="close()">
      <template #header>
        <h2>Informacije o korisniku</h2>
      </template>
      <template #body>

      </template>
    </modal-layout> -->


  </div>
</template>


<script setup>
import { useRoute } from 'vue-router';
import modalLayout from '@/components/modalLayout.vue';
import TimerView from '@/views/TimerView.vue';
import { showModal } from '@/composables/modal';
import { shallowRef, ref, onMounted, computed } from 'vue';
import TimerTable from './components/layout/TimerTable.vue';
import Skeleton from 'primevue/skeleton';
const { isOpen, show, close } = showModal();
import store from '@/store';
import UserView from './views/UserView.vue';
const components = shallowRef([{ component: TimerView }, { component: TimerTable, props: { width: "1300px" } }]);
const stepIndex = ref(0);
const route = useRoute();
// const categories = ref(null);
// const showAnother = ()=>{
//   stepIndex.value++;
// }

const allCategories = computed(() => {
  return store.getters['category/getListOfCategories'];
})

const getAllCategories = async () => {
  await store.dispatch("category/getAll");
}

function isActive(path) {
  const split = route.path.toLocaleLowerCase().split(path.toLocaleLowerCase())[0];
  // console.log(split,route.path.toLocaleLowerCase(),path.toLocaleLowerCase());
  if(split === route.path){
    return path === route.path;
  }
  else{
    return route.path.toLocaleLowerCase().includes(path.toLocaleLowerCase());
  }
}
function showTimerModal() {
  components.value = [{ component: TimerView }, { component: TimerTable, props: { width: "1300px" } }];
  show();
}

const showUserModal = () => {
  components.value = [{ component: UserView }];
  show();
}
onMounted(() => {
  getAllCategories();
})
const routeLink = (cat) => {
  return cat.name === 'Heating/Cooling' ? 'Temperature' : cat.name
}
</script>


<style>
/* @import "tailwindcss";
@import "tailwindcss/components";
@import "./primevue/tailwind.css";
@import "tailwindcss/utilities"; */
* {
  margin: 0px;
  padding: 0px;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

a {
  text-decoration: none;
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
}

.lamp.active i:not(:last-child),
.lamp.active svg {
  filter: drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #fff) drop-shadow(0 0 30px #fff) drop-shadow(0 0 80px #fff);
}

.lamp.active i:not(:last-child)::before {
  content: '\f0eb';
  font-weight: 700;
}

.lamp {
  width: 20%;
  border-radius: 5px;
  text-align: center;
  padding: 20px 0px 7px 0px;
  cursor: pointer;
  transition: all 300ms;
  border: 1px solid transparent;
  filter: drop-shadow(0px 0px 0px transparent);
  color: #fff;
}

.slidedown-enter-active,
.slidedown-leave-active {
  transition: max-height 0.5s ease-in-out;
}

.slidedown-enter-to,
.slidedown-leave-from {
  overflow: hidden;
  max-height: 1000px;
}

.slidedown-enter-from,
.slidedown-leave-to {
  overflow: hidden;
  max-height: 0;
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
  font-family: 'Poppins', sans-serif;
}

.lamp:hover {
  border: 1px solid #fff;
}

.login-background {
  min-height: 220vh;
  background-color: #011134;
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
  border: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 0 40px rgba(8, 7, 16, 0.6);
  /* padding: 20px 10px 20px 10px !; */
}

.login-form,
.register-form {
  height: max-content;
  width: 700px;
  background-color: rgba(255, 255, 255, 0.13);
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
  font-family: 'Poppins', sans-serif;
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
  height: 50px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.07);
  border-radius: 3px;
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

}

.tabs input:nth-child(1):checked~.buttons label:nth-child(1),

.tabs input:nth-child(2):checked~.buttons label:nth-child(2),

.tabs input:nth-child(3):checked~.buttons label:nth-child(3),

.tabs input:nth-child(4):checked~.buttons label:nth-child(4),

.tabs input:nth-child(5):checked~.buttons label:nth-child(5) {

  color: #fff;

  opacity: 1;

  filter: drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #fff);

}

.underline {

  position: absolute;

  left: 0;

  bottom: 0;

  width: 20%;

  height: 5px;

  transition: 0.5s;

}

.underline::before {

  content: '';

  position: absolute;

  left: 50%;

  transform: translateX(-50%);

  width: 40px;

  height: 100%;

  background: #fff;

  border-radius: 4px;

  filter: drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #fff) drop-shadow(0 0 30px #fff) drop-shadow(0 0 50px #fff);

}

.underline::after {

  content: '';

  position: absolute;

  left: 50%;

  transform: translateX(-50%);

  width: 40px;

  height: 100%;

  background: #fff;

  border-radius: 4px;

  filter: drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #fff) drop-shadow(0 0 30px #fff) drop-shadow(0 0 50px #fff);

}

.tabs input:nth-child(1):checked~.buttons .underline {

  left: 0;

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
  margin-top: 29px;
  gap: 20px;
  flex-wrap: wrap;
}



/* Za stranice */


.container {
  position: relative;
  width: 100%;
  max-height: max-content;
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
}
@media only screen and (max-width: 900px) {
  .header-group{
    font-size: 25px;
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
  .group-content{
    width: 95%;
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
}

@media only screen and (max-width: 400px) {

  .register-form,
  .login-form {
    width: 323px;
  }

  .login-form {
    left: 50%;
    height: max-content;
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
}

.block-fixed {
  display: flex;
  justify-content: space-between;
  width: 100%;
  position: fixed;
  bottom: 20px;
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
  color: white;
}
</style>
