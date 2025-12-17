<template>
    <div>
        <h2>Selektujte uređaje koje želite da obrišete (1 ili više)</h2>
        <DeviceFormCheckBox @devices="handleDevicesLoaded" @change="handleCheckedDevices"></DeviceFormCheckBox>

        <ButtonMy variant="glass" class="w-100" :disabled="!canDelete" @click="removeDevice()">
            <template #icon>
                <Icon icon="pajamas:remove-all" width="22" height="22" />
            </template>
            Izbrišite odabrane uređaje
        </ButtonMy>
        <template v-if="msgError">
            <p>{{ msgError }}</p>
        </template>
    </div>

</template>
<script setup>
import DeviceFormCheckBox from '@/features/devices/DeviceFormCheckBox.vue';
import ButtonMy from '../ui/ButtonMy.vue';
import store from '@/store';
import { ref, defineEmits, computed } from 'vue';
import { useToast } from "vue-toastification";
import { Icon } from '@iconify/vue';

const allDevices = ref([]);
const checkedDevices = ref([]);

const isLoadingDevices = ref(true);


const toast = useToast();
const msgError = ref(null);


const handleDevicesLoaded = (devices) => {
    allDevices.value = devices;
    isLoadingDevices.value = false;
    msgError.value = null;
};

const handleCheckedDevices = (devices) => {
    checkedDevices.value = devices;
    msgError.value = null;
};


const canDelete = computed(() => {
    console.log(isLoadingDevices.value, allDevices.value.length, checkedDevices.value.length);
    return !isLoadingDevices.value &&
        allDevices.value.length > 0 &&
        checkedDevices.value.length > 0;
});

const emit = defineEmits(['close']);

const removeDevice = async () => {

    try {
        if (checkedDevices.value == null || !checkedDevices.value.length) {
            console.log("Ulsi u if koji ne treba da udjemo");
            msgError.value = "Morate odabrati uređaje";
            return;
        }
        await store.dispatch('device/deleteDevices', { ids: checkedDevices.value });
        emit('close');
        if (checkedDevices.value.length == 1) {
            toast.success("Uspešno ste obrisali uređaj");
        }
        else {
            toast.success("Uspešno ste obrisali uređaje");
        }

    }
    catch (xhr) {
        toast.error(xhr.message);
    }
}
</script>
<style scoped>
h2 {
    font-size: 1.1rem;
}
.w-100{
    width: 100%;
}
</style>