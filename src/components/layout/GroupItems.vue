    <template>
        <div class="group-items background-block"
            :class="{ scale: isClass || automaticOpen, glowEffect: devicesAllTurn }">
            <div class="header-group-content">
                <button v-if="showButtonOfTurnAll"  @click="confirmDelete()"  class="remove-group close-button">X</button>
                <h3 v-if="!doesChangeGroupName" class="header-group header-group-pencil">{{ groupName }} <span v-if="doesChangeGroupNameProps" @click="changeGroupNameFunc()"><PhPencil :size="32" /></span></h3>
                <div v-else class="changeGroupNameBlock">
                  <PhXCircle @click="changeGroupNameFunc()" :size="32" />
                  <FormInput class="form-input" id="groupName" name="groupName" v-model="newGroupName"/>
                  <button-my @click="changeGroupName()">Izmeni</button-my>
                </div>

                <ButtonMy  @click.stop="turnOnAll($event)" v-if="showButtonOfTurnAll && devices && devices.length" class="activeAll">
                  <PhCheck v-if="devicesAllTurn" :size="32" />
                  <PhX v-else :size="32" />
                </ButtonMy>

            </div>
            <div class="line-block">
                <hr />
                <span class="load-line"></span>
            </div>
            <div @click="showMenu()" class="down-group-items">
                <i class="fa-solid fa-arrow-down"></i>
            </div>
            <transition name="slidedown" mode="out-in">
                <div v-if="showMenuProp || automaticOpen" class="slide-menu main">
                    <template v-if="devices && devices.length > 0">
                        <item-block v-for="item in devices" :key="item.id" :data="item">
                        </item-block>
                    </template>
                    <template v-if="devices && devices.length === 0">
                        <p class="text-info">Trenutno nemate uređaje u grupi</p>
                    </template>
                  <template v-if="!devices">
                    <ProgressSpinner/>
                  </template>
                    <div v-if="addDeviceOptions" class="w-100 d-flex-center">
                        <div class="lamp background-block py-5" @click="show()">
                            <a href="#"><i class="fa-solid fa-plus"></i></a>
                        </div>
                    </div>
                </div>
            </transition>
          <Teleport to="body">
            <modal-layout :title="titleOfModal" :modal-content="modalContent" :confirm="confirm" :visible="isOpen" @close="closeModal()">
              <template #body>
                <!-- Vidi da li moze da se ovo bolje odradi! -->
                <SelectingFormView :textOnButtons="textOnButton" :showModals="showModals" v-if="activeForms === ''" @changeForms="setNewForms" />
                <DeviceForm :idGrupe="id" v-if="activeForms === 'newDevice'" />
                <DeviceFormCheckBox :idGrupe="id" stepForm="true" v-if="activeForms === 'addDevice'"
                                    @changeForms="setNewForms" @close="closeModal()" />
              </template>
            </modal-layout>
          </Teleport>
        </div>


    </template>
<script setup>
import { ref, defineProps, computed, watch} from 'vue';
import itemBlock from './itemBlock.vue';
import modalLayout from '../modalLayout.vue';
import { showModal } from '@/composables/modal'; // Uvođenje composable-a
import SelectingFormView from '@/features/others/selectingFormView.vue';
import DeviceForm from '@/features/devices/DeviceForm.vue';
import DeviceFormCheckBox from '@/features/devices/DeviceFormCheckBox.vue';
import store from '@/store';
import { useToast } from 'vue-toastification';
import ButtonMy from "@/components/ui/ButtonMy.vue";
import FormInput from "@/components/ui/FormInput.vue";
import ProgressSpinner from 'primevue/progressspinner';
import {PhCheck, PhPencil, PhXCircle,PhX} from "@phosphor-icons/vue";

// import device from '@/store/modules/device';

const showMenuProp = ref(false);
const isClass = ref(false);
const turnAllClassActive = ref(false);
let activeForms = ref('');
const shouldTurnOn = ref(false);
const doesChangeGroupName = ref(false);
const titleOfModal = ref('');
const textOnButton = ref(['Dodaj novi uredjaj','Dodaj vec postojeci uredjaj']);
const showModals = ref(['newDevice','addDevice']);
const toast = useToast();
const { isOpen, show, close, modalContent, confirm } = showModal();
const props = defineProps({
    devices: {
        type: Array,
        required: true
    },
    showButtonOfTurnAll: {
        type: Boolean,
        required: false,
        default: true
    },
    automaticOpen: {
        required: false,
        defualt: false
    },
    addDeviceOptions:{
      required : false,
      default: true
    },
  doesChangeGroupNameProps:{
    required:false,
    default:true
  },
    groupName: String,
    id: Number,
    idDevice: Number,
})
const devicesProba = ref(props.devices);
watch(()=>props.devices,(newValue)=>{
    devicesProba.value = newValue;
})

// const checkRangeOfDevice = ()=>{
//   return props.devices.some(x=>x.is_out_of_range);
// }
const closeModal = () => {
    activeForms.value = "";
    close();
}
const devicesAllTurn = computed(()=>{
    if(devicesProba.value){
        return devicesProba.value.length && devicesProba.value.every(x=>x.status);
    }
    return false;
});
const setNewForms = (selectedForms) => {
  if(selectedForms === 'newDevice'){
    titleOfModal.value = "Dodaj uređaj";
  }
  else if(selectedForms === 'addDevice'){
    titleOfModal.value = 'Izaberi uređaj';
  }
  activeForms.value = selectedForms
};
function turnOnAll() {
    activeForms.value = null;
    shouldTurnOn.value = devicesProba.value.filter(device => device.status).length!==devicesProba.value.length;
    titleOfModal.value = 'Pitanje';
    show(`Da li da zelite sve uredjaje da ${shouldTurnOn.value ? 'upalite' : 'ugasite'}?`, turnAllDevice);
}

async function turnAllDevice(){
    turnAllClassActive.value = !turnAllClassActive.value;
    try{
      const devicesIds = mappingDevicesToIds();
        await store.dispatch("device/changeStautsOfDeviceInGroup",{status:shouldTurnOn.value,id:props.id,ids:devicesIds});
        toast.success('Uspesno ste promenili status uredjaja u grupi', {
            timeout: 3000
        });
    }
    catch(error){
        toast.error(error.message, {
            timeout: 3000
        });
    }
}

function mappingDevicesToIds(){
  return props.devices.map((x)=>x.id);
}

function showMenu() {
    showMenuProp.value = !showMenuProp.value
    isClass.value = !isClass.value;
}
const removeGroup = async () => {
    try {
        await store.dispatch("group/RemoveGroup", props.id);
        toast.success('Uspesno ste obrisali grupu', {
            timeout: 3000
        });
    }
    catch (error) {
        toast.error(error.message, {
            timeout: 3000
        });
    }
}
const confirmDelete = ()=>{
    activeForms.value = null;
    titleOfModal.value = 'Pitanje';
    show(`Da li ste sigurni da želite da obrišete grupu "${props.groupName}"?`, removeGroup);
}

const changeGroupName = async ()=>{
  const data = {
    name : newGroupName.value,
    id: props.id
  };
  try{
    await store.dispatch('group/changeGroupName',data);
    toast.success('Uspesno ste izmenili naziv grupe',{
      timeout: 3000
    });
    doesChangeGroupName.value = !doesChangeGroupName.value;
  }
  catch (error){
    toast.error(error.message,{
      timeout: 3000
    });
  }
}

const changeGroupNameFunc = ()=>{
  newGroupName.value = props.groupName;
  doesChangeGroupName.value = !doesChangeGroupName.value;
}

const newGroupName = ref(props.groupName);
</script>
<style scoped>
.changeGroupNameBlock{
  display:flex;
  gap:20px;
  align-items: center;
}
.changeGroupNameBlock button{
  font-size: 15px;
  font-weight: 200;
}
.changeGroupNameBlock i{
  cursor:pointer;
}
.form-input input{
  background-color: transparent !important;
  border:none !important;
  border-bottom: 2px solid black !important;
}

.w-100 {
    width: 100%;
}

.d-flex-center {
    display: flex;
    justify-content: center;
}

.text-info {
    color: #fff;
    font-size: 25px;
}

.remove-group {
    position: absolute;
    top: 7px;
    left: 7px;
    cursor: pointer;
}

.glowEffect {
    /* transition: all 300ms; */
    box-shadow: 0 0 20px 2px #fff;
    /* filter:drop-shadow(0 0 10px #fff) drop-shadow(0 0 20px #fff) drop-shadow(0 0 30px #fff) drop-shadow(0 0 80px #fff); */
}

.line-block {
    position: relative;
}

.load-line {
    display: block;
    width: 0%;
    height: 5px;
    background-color: #4da34d;
    transition: all 500ms;
    position: absolute;
    top: 0px;
    left: 0px;
}

.scale .load-line {
    width: 100%;
}

.scale {
    transform: scale(1.02);
}

.down-group-items {
    height: 40px;
    cursor: pointer;
    text-align: center;
}

.scale .fa-arrow-down {
    transform: rotate(180deg);
}

.down-group-items i {
    color: white;
    font-size: 20px;
    padding: 15px 0px;
    transition: all 500ms;
}

.header-group {
    width: 50%;
    display: flex;
    align-items:center;
    gap:25px;
}
.header-group i{
  font-size:25px;
  cursor:pointer;
}
.moje2 {
    display: none;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    color: #000;
    font-size: 25px;
}

.group-button {
    width: 80%;
    text-align: right;
    cursor: pointer;
}

.arrowPravi {
    display: inline-block;
    font-weight: 900;
    cursor: pointer;
}

.customCheckbox {
    appearance: none;
    background-color: var(--form-background);
    margin: 0;
    font: inherit;
    color: currentColor;
    width: 1.15em;
    height: 1.15em;
    border: 0.15em solid currentColor;
    border-radius: 0.15em;
    transform: translateY(-0.075em);
    display: grid;
    place-content: center
}

input.moje:checked~.arrowPravi::after {
    content: '\f00c';
    font-family: "Font Awesome 6 Free";
    vertical-align: middle;
    display:block;
    visibility: visible;
    transform:translateY(60%);
}

.arrowPravi::after {
    content: '2';
    visibility: hidden;
}

.arrowPravi {
    display: inline-block;
    width: 40px;
    background-color: transparent;
    //border: 2px solid #fff;
    border-radius: 2px;
    height: 40px;
}
.activeAll {
    margin-left: auto;
    border-color: white;
    width: 3vw;
    height: 5vh;
    /* margin-left: 10px; */
    padding: 10px;
}
.activeAll svg{
  width: 22px;
  height:22px
}

.arrow {
    transition: all 300ms;
}

.arrow-down {
    transform: rotate(0deg);
}

.arrow-up {
    transform: rotate(180deg);
}

.header-group-content {
    color: #fff;
    font-size: 30px;
    display: flex;
    justify-content: space-between;
    min-height: 120px;
    align-items: center;
    margin-left: 30px;
}

.group-items {
    margin:0px auto;
    margin-top: 50px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    padding: 10px 10px 10px 10px;
    transition: all 300ms;
    position: relative;
}

button {
    background-color: transparent;
    outline: none;
    border: none;
    width: max-content;
    display: inline-block;
    margin-top: 0px;
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
.py-5{
  padding: 10px ;
}
</style>