// composables/useModalFlow.js
import { ref, shallowRef, computed } from 'vue'
import { useToast } from 'vue-toastification'
import store from '@/store'
import DeviceForm from '@/features/devices/DeviceForm.vue'
import SelectingFormView from '@/features/others/selectingFormView.vue'
import GroupForm from '@/features/groups/GroupForm.vue'
import DeviceFormCheckBox from '@/features/devices/DeviceFormCheckBox.vue'
import MobileTimerView from '@/components/ui/MobileTimerView.vue'
import TimerView from '@/views/TimerView.vue'
import TimerTable from '@/components/layout/TimerTable.vue'
import UserView from '@/views/UserView.vue'
import CheckDeviceForDelete from '@/components/modals/checkDeviceForDelete.vue'
import ListOfTermostat from '@/components/modals/listOfTermostat.vue'

export function useModalFlow() {
  const toast = useToast()
  
  // Centralizovan modal state
  const modalState = ref({
    isOpen: false,
    type: null, // 'timer', 'device', 'group', 'user', 'delete'
    currentStep: 0,
    formData: new Map(), // Koristi Map umesto array-a
    components: [],
    content: null
  })

  // Modal tipovi kao konstante
  const MODAL_TYPES = {
    TIMER: 'timer',
    DEVICE_GROUP: 'device_group',
    USER: 'user',
    DELETE_DEVICES: 'delete_devices',
    LIST_OF_TERMOSTAT: 'termostat',
  }

  // Computed properties za lakše čitanje
  const isTimerModal = computed(() => modalState.value.type === MODAL_TYPES.TIMER)
  const isDeviceGroupModal = computed(() => modalState.value.type === MODAL_TYPES.DEVICE_GROUP)

  // Otvaranje različitih tipova modala
  const openTimerModal = () => {
    const isMobile = window.innerWidth <= 768
    
    modalState.value = {
      isOpen: true,
      type: MODAL_TYPES.TIMER,
      currentStep: 0,
      formData: new Map(),
      components: [
        { component: TimerView, props: { title: "Dodaj tajmer" } },
        { component: MobileTimerView, props: { title: "Lista tajmera" } }
      ],
      content: null
    }
  }

  const openDeviceGroupModal = () => {
    modalState.value = {
      isOpen: true,
      type: MODAL_TYPES.DEVICE_GROUP,
      currentStep: 0,
      formData: new Map(),
      components: [{
        component: SelectingFormView,
        props: {
          buttons: [{
            text : "Dodaj novi uređaj",
            icon : 'carbon:data-enrichment-add',
            modalId : { component: DeviceForm, props: { title: "Dodaj uređaj" } }
          },{
            text :  "Dodaj novu grupu",
            icon : 'carbon:cics-system-group',
            modalId : [
              { component: GroupForm, props: { previousValue: {}, title: "Kreiraj novu grupu",internValidation : false } },
              { component: DeviceFormCheckBox, props: { previousValue: {}, title: "Izaberi uređaje",internValidation : false } }
            ]
          }]
        }
      }],
      content: null
    }
  }

  const openUserModal = () => {
    modalState.value = {
      isOpen: true,
      type: MODAL_TYPES.USER,
      currentStep: 0,
      formData: new Map(),
      components: [{ component: UserView, props: { title: 'Korisnički profil' } }],
      content: null
    }
  }

  const openDeleteDevicesModal = () => {
    modalState.value = {
      isOpen: true,
      type: MODAL_TYPES.DELETE_DEVICES,
      currentStep: 0,
      formData: new Map(),
      components: [],
      content: CheckDeviceForDelete
    }
  }

  const openListOfTermostatModal = ()=>{
     modalState.value = {
      isOpen: true,
      type: MODAL_TYPES.LIST_OF_TERMOSTAT,
      currentStep: 0,
      formData: new Map(),
      components: [],
      content: ListOfTermostat
    }
  }

  // Upravljanje form podacima
  const updateFormData = (stepIndex, data) => {
    modalState.value.formData.set(stepIndex, data)
    
    console.log(modalState.value);

    // Ažuriraj props za sledeći korak ako postoji
    if (modalState.value.components[stepIndex + 1]) {
      modalState.value.components[stepIndex + 1].props.previousValue = data
    }
  }

  // Promena komponenti
  const changeComponents = (newComponents) => {
    modalState.value.components = Array.isArray(newComponents) ? newComponents : [newComponents]
  }

  // Finalizacija modal-a
  const finishModal = async (data = null) => {
    try {
      const result = await handleModalFinish(data)
      if (result.success) {
        closeModal()
        toast.success(result.message, { timeout: 3000 })
      }
    } catch (error) {
      toast.error(error.message, { timeout: 3000 })
    }
  }

  // Glavna logika za završetak modal-a
  const handleModalFinish = async (localData = null) => {
    const { type, formData } = modalState.value

    switch (type) {
      case MODAL_TYPES.TIMER:
        return { success: true, message: "Tajmer uspešno kreiran!" }
        
      case MODAL_TYPES.DEVICE_GROUP:
        return await handleDeviceGroupFinish(localData)
        
      case MODAL_TYPES.USER:
        return { success: true, message: "Profil ažuriran!" }
        
      case MODAL_TYPES.DELETE_DEVICES:
        return { success: true, message: "Uređaji obrisani!" }
        
      default:
        throw new Error("Nepoznat tip modal-a")
    }
  }

  // Specifična logika za device/group modal
  const handleDeviceGroupFinish = async (localData = null) => {
    let groupData, deviceData

    if (localData && localData.length > 0) {
      [groupData, deviceData] = localData
    } else {
      groupData = modalState.value.formData.get(0)
      deviceData = modalState.value.formData.get(1)
    }

    const payload = {
      name: groupData?.grupaUredjaja || groupData?.name,
      ids: deviceData?.devices || deviceData?.selectedDevices || []
    }

    if (!payload.name) {
      throw new Error("Ime grupe je obavezno!")
    }

    await store.dispatch('group/addGroup', payload)
    return { success: true, message: "Grupa uspešno kreirana!" }
  }

  // Zatvaranje modal-a
  const closeModal = () => {
    modalState.value = {
      isOpen: false,
      type: null,
      currentStep: 0,
      formData: new Map(),
      components: [],
      content: null
    }
  }

  // Navigacija kroz korake
  const nextStep = () => {
    if (modalState.value.currentStep < modalState.value.components.length - 1) {
      modalState.value.currentStep++
    }
  }

  const previousStep = () => {
    if (modalState.value.currentStep > 0) {
      modalState.value.currentStep--
    }
  }

  return {
    // State
    modalState: computed(() => modalState.value),
    isTimerModal,
    isDeviceGroupModal,
    
    // Actions
    openTimerModal,
    openDeviceGroupModal,
    openUserModal,
    openDeleteDevicesModal,
    openListOfTermostatModal,
    updateFormData,
    changeComponents,
    finishModal,
    closeModal,
    nextStep,
    previousStep,
    // Constants
    MODAL_TYPES
  }
}