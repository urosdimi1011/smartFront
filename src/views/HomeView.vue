  <template>
    <div class="group-content">
      <div v-if="groups && groups.length > 0" id="LightPage">
      <group-items v-for="item in groups" :key="item.id" :groupName="item.name" :id="item.id" :idDevice="item.id"
        :devices="item.devices"></group-items>
    </div>
    <div v-if="groups === null" class="spinner-container">
      <ProgressSpinner/>
    </div>

    <div class="add-group">
        <div @click="showModalDevice(0)" class="lamp background-block">
          <a href="#"><i class="fa-solid fa-plus"></i></a>
          <p>Kreiraj novu grupu</p>
        </div>
      </div>
      <div class="add-group">
        <div @click="showModalDevice(1)" class="lamp background-block">
          <a href="#"><i class="fa-solid fa-plus"></i></a>
          <p>Kreiraj novi uredjaj</p>
        </div>
      </div>
      <group-items :devices="devicesAll" groupName="Lista svih uredjaja" automaticOpen="true" :showButtonOfTurnAll="false" :addDeviceOptions="false"></group-items>
      <Teleport to="body">
        <modal-layout :visible="isOpen" @close="closeAll()" :steps="condicional ? newDevica : steps"
          @getDatas="setToStepRecivedData" @finish="sendAllData">
          <template #header>
            <div class="modal-header">
              <h2>Grupa</h2>
              </div>
          </template>
        </modal-layout>
      </Teleport>
    </div>
  </template>
<script setup>
import { ref, onMounted, onUpdated, shallowRef,computed } from 'vue';
import GroupForm from '../features/groups/GroupForm.vue';
import DeviceFormCheckBox from '../features/devices/DeviceFormCheckBox.vue';
import modalLayout from '../components/modalLayout.vue';
import { showModal } from '../composables/modal'; // Uvođenje composable-a
import groupItems from '../components/layout/GroupItems.vue';
import DeviceForm from '@/features/devices/DeviceForm.vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import ProgressSpinner from 'primevue/progressspinner';

const { isOpen, show, close } = showModal();
const store = useStore();
const toast = useToast();
const steps = shallowRef([{ component: GroupForm, props: { previousValue: {} } }
  , { component: DeviceFormCheckBox, props: { previousValue: {} } }]);
const newDevica = shallowRef([{ component: DeviceForm, props: { previousValue: {} } }]);
const condicional = ref(false);
// var items = ref([]);
const groups = computed(()=>{
  return store.getters['group/getAllGroups'];
})
const devicesAll = computed(()=>{
  // console.log(store.getters['device/getAllDevices']);
  return store.getters['device/getAllDevices'];
})

onUpdated(() => {
  console.log(steps.value);
})

const showModalDevice = (which) => {
  if (which == 1) {
    condicional.value = true;
  }
  else {
    condicional.value = false;
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
  }
  catch(error){
    toast.error(error, {
        timeout: 3000
      });
  }
  // items.value = response.groups;
}

const setToStepRecivedData = (data) => {
  steps.value[data.step - 1].props.previousValue = data;
}

const sendAllData = async () => {
  const data = {
    name: steps.value[0]?.props?.previousValue?.grupaUredjaja,
    ids: steps.value[1]?.props?.previousValue?.devices
  };
  try{
    await store.dispatch('group/addGroup',data);
    close();
      toast.success("Uspešno sačuvano!", {
        timeout: 3000
      });
  }
  catch(error){
    toast.error(error.message, {
        timeout: 3000
      });

  }
  // if(response.status === 201){
    // }
    // else{
      //   toast.error(response.data.message, {
        //     timeout: 3000
        //   });
        // }
}

const closeAll = () => {
  // steps.value.forEach((x)=>x.props.previousValue = {});
  close();
}


onMounted(() => {
  fetchItems();
});


</script>

<style scoped>
.add-group {
  display: flex;
  justify-content: center;
  margin: 80px 0px;
  color: #fff;
}

.add-group p {
  font-size: 20px;
}
</style>