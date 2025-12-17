  <template>
    <div class="group-content">
      <div v-if="!isLoading && localItems && groups && groups.length > 0" id="LightPage">
        <draggable v-model="localItems" group="components" item-key="id" @end="onEnd" @update:modelValue="onModelUpdate"
          :animation="200" :ghostClass="'dragging-item'" :delay="800">
          <template #item="{ element }">
            <group-items v-if="element && element.name" :groupName="element.name" :id="element.id"
              :idDevice="element.id" :devices="element.devices" />
          </template>
        </draggable>
      </div>
      <group-items v-if="!isLoading" :id="1000" :removeOption="false" :doesChangeGroupNameProps="false"
        :devices="devicesAll" groupName="Lista svih uređaja" :automaticOpen="true" :showButtonOfTurnAll="false"
        :addDeviceOptions="false">
        <template #icon>
          <Icon icon="streamline-freehand:network-monitor-hierarchy" width="24" height="24" />        
        </template>
      </group-items>

      <Teleport to="body">
        <modal-layout :visible="isOpen" @close="closeAll()" :steps="condicional ? newDevica : steps"
          @getDatas="setToStepRecivedData" @finish="sendAllData">
        </modal-layout>
      </Teleport>
    </div>
  </template>
<script setup>
import { ref, onMounted, shallowRef, computed, defineOptions, watch, toRaw } from 'vue';
import GroupForm from '../features/groups/GroupForm.vue';
import DeviceFormCheckBox from '../features/devices/DeviceFormCheckBox.vue';
import modalLayout from '../components/modalLayout.vue';
import Draggable from 'vuedraggable';
import { showModal } from '@/composables/modal';
import groupItems from '../components/layout/GroupItems.vue';
import DeviceForm from '@/features/devices/DeviceForm.vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import { deepToRaw, setItem } from "@/config/indexedDB";
import { PhNetworkX } from '@phosphor-icons/vue';
import { Icon } from '@iconify/vue';

const store = useStore();
const toast = useToast();
const { isOpen, show, close } = showModal();

const groups = computed(() => {
  return store.getters['group/getAllGroups'];
});

const isLoading = computed(() => {
  return store.getters['device/isLoading'] || store.getters['group/isLoading'];
});

const steps = shallowRef([{ component: GroupForm, props: { previousValue: {}, title: "Kreiraj novu grupu" } }
  , { component: DeviceFormCheckBox, props: { previousValue: {}, title: "Izaberi uredjaje" } }]);
const newDevica = shallowRef([{ component: DeviceForm, props: { previousValue: {}, title: "Dodaj uređaj" } }]);

const localItems = ref([]);
const condicional = ref(false);

const devicesAll = computed(() => {
  return store.getters['device/getAllDevices'];
})

defineOptions({
  inheritAttrs: false
});

onMounted(async () => {
  // await store.dispatch("group/assignDevicesToGroups", null, { root: true });

  localItems.value = groups.value;
});

const onModelUpdate = (newValue) => {
  store.commit('group/setGroups', [...newValue]);
}

// Ovo je potrebno za drag and drop deo funkcionalnosti!

const onEnd = async () => {
  //Ovaj podatak upisujemo u indexedDB!!
  const rawItems = deepToRaw(localItems.value);
  console.log(rawItems);

  const sendToServer = rawItems.map((x, index) => {
    return { id: x.id, order: index }
  }
  )
  store.dispatch('group/changeOrderOfGroup', sendToServer);
  store.commit('group/updateGroupsOrder', localItems.value);
};
const setToStepRecivedData = (data) => {
  steps.value[data.step - 1].props.previousValue = data;
}
watch(() => store.getters['group/getAllGroups'], (newValue) => {
  localItems.value = newValue;
})

const sendAllData = async () => {
  const data = {
    name: steps.value[0]?.props?.previousValue?.grupaUredjaja,
    ids: steps.value[1]?.props?.previousValue?.devices
  };
  try {
    await store.dispatch('group/addGroup', data);
    close();
    toast.success("Uspešno sačuvano!", {
      timeout: 3000
    });
  }
  catch (error) {
    toast.error(error.message, {
      timeout: 3000
    });
  }
}
const closeAll = () => {
  close();
}


</script>

<style scoped>
.add-group {
  display: flex;
  justify-content: center;
  margin: 80px 0px;
  color: #fff;
}

.draggable-item {
  cursor: grab;
  border: 1px solid #ddd;
  padding: 10px;
  margin: 5px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

#LightPage {
  touch-action: manipulation;
  -webkit-user-select: none;
  /* Blokira selekciju na iOS-u */
  -webkit-touch-callout: none;
  /* Sprečava dug pritisak da otvori meni */
}

.group-items {
  position: relative;
}

.draggable-item:active {
  cursor: grabbing;
}

.dragging-item {
  opacity: 0.5;
  /* Napravi ga providnijim */
  background-color: #ddd;
  /* Doda svetliju boju */
  border: 2px dashed #888;
  /* Stavi isprekidanu ivicu */
  transform: scale(1.05);
  /* Blago ga povećaj */
}

.add-group p {
  font-size: 20px;
}
</style>