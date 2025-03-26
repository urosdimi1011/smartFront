    <template>
        <div class="group-items background-block"
            :class="{ scale: isClass || automaticOpen, glowEffect: devicesAllTurn }">
            <div class="header-group-content">
                <button v-if="showButtonOfTurnAll" class="remove-group" @click="confirmDelete()">X</button>
                <h3 class="header-group">{{ groupName }}</h3>
                
                <ButtonMy v-if="showButtonOfTurnAll && devices && devices.length" class="activeAll"><input :id="'activeAllItems' + id" :checked="devicesAllTurn" disabled class="moje2" :class="{moje : devicesAllTurn}"
                        type="checkbox" /><label :for="'activeAllItems' + id" class="arrowPravi"
                        @click.stop="turnOnAll($event)"></label></ButtonMy>

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
                    <template v-if="devices && devices.length">
                        <item-block v-for="item in devices" :key="item.id" :data="item">
                        </item-block>
                    </template>
                    <template v-else>
                        <p class="text-info">Trenutno nemate uredjaje u grupi</p>
                    </template>
                    <div v-if="addDeviceOptions" class="w-100 d-flex-center">
                        <div class="lamp background-block" @click="show()">
                            <a href="#"><i class="fa-solid fa-plus"></i></a>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
        <Teleport to="body">
            <modal-layout :modal-content="modalContent" :confirm="confirm" :visible="isOpen" @close="closeModal()">
                <template #header>
                    <!-- <div class="modal-header">
                        <h2>Unesite uredjaj</h2>
                    </div> -->
                </template>
                <template #body>
                    <!-- Vidi da li moze da se ovo bolje odradi! -->
                    <SelectingFormView :textOnButtons="textOnButton" :showModals="showModals" v-if="activeForms === ''" @changeForms="setNewForms" />
                    <DeviceForm :idGrupe="id" v-if="activeForms === 'newDevice'" />
                    <DeviceFormCheckBox :idGrupe="id" stepForm="true" v-if="activeForms === 'addDevice'"
                        @changeForms="setNewForms" @close="closeModal()" />
                </template>
            </modal-layout>
        </Teleport>


    </template>
<script setup>
import { ref, defineProps, computed, watch} from 'vue';
import itemBlock from './itemBlock.vue';
import modalLayout from '../modalLayout.vue';
import { showModal } from '../../composables/modal'; // Uvođenje composable-a
import SelectingFormView from '@/features/others/selectingFormView.vue';
import DeviceForm from '@/features/devices/DeviceForm.vue';
import DeviceFormCheckBox from '@/features/devices/DeviceFormCheckBox.vue';
import store from '@/store';
import { useToast } from 'vue-toastification';
// import device from '@/store/modules/device';

const showMenuProp = ref(false);
const isClass = ref(false);
const turnAllClassActive = ref(false);
let activeForms = ref('');
const shouldTurnOn = ref(false);
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
    groupName: String,
    id: Number,
    idDevice: Number,
})
const devicesProba = ref(props.devices);
watch(()=>props.devices,(newValue)=>{
    devicesProba.value = newValue;
})

const closeModal = () => {
    close();
    activeForms.value = "";
}
const devicesAllTurn = computed(()=>{
    if(devicesProba.value){
        return devicesProba.value.length && devicesProba.value.every(x=>x.status);
    }
    return false;
});
const setNewForms = (selectedForms) => activeForms.value = selectedForms;
function turnOnAll() {
    activeForms.value = null;
    shouldTurnOn.value = devicesProba.value.filter(device => device.status).length!==devicesProba.value.length;
    show(`Da li da zelite sve uredjaje da ${shouldTurnOn.value ? 'upalite' : 'ugasite'}?`, turnAllDevice);
}

async function turnAllDevice(){
    turnAllClassActive.value = !turnAllClassActive.value;
    try{
        await store.dispatch("device/changeStautsOfDeviceInGroup",{status:shouldTurnOn.value,id:props.id});
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
    show(`Da li ste sigurni da želite da obrišete grupu "${props.groupName}"?`, removeGroup);
}



</script>
<style scoped>
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
    top: 10px;
    left: 20px;
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
    background-color: green;
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
    width: 20%;
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
    visibility: visible;
}

.arrowPravi::after {
    content: '2';
    visibility: hidden;
}

.arrowPravi {
    display: inline-block;
    width: 40px;
    background-color: transparent;
    border: 2px solid #fff;
    border-radius: 2px;
    height: 40px;
}

input.moje:checked~.arrowPravi {
    outline: max(3px, 0.15em) solid white;
    outline-offset: max(3px, 0.15em);
}


.activeAll {
    margin-left: auto;
    border-color: white;
    /* margin-left: 10px; */
    padding: 10px;
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
</style>