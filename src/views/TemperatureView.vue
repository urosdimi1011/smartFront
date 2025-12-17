<template>
    <div class="group-content">
        <div class="buttons-container">
            <ButtonMy :disabled="isLoading" variant="glass" @click="getDevices('Heating', 1)" :class="{
                'active-button': activeButton === 1,
            }" :loading="isLoading && activeButton === 1">
                <span>Prikaži uređaje za grejanje</span>
                <template #icon>
                    <PhFlame size="22" />
                </template>
            </ButtonMy>

            <ButtonMy :disabled="isLoading" variant="glass" @click="getDevices('Cooling', 2)" :class="{
                'active-button': activeButton === 2,
            }" :loading="isLoading && activeButton === 2">
                <span>Prikaži uređaje za hlađenje</span>
                <template #icon>
                    <PhSnowflake size="22" />
                </template>
            </ButtonMy>
        </div>

        <group-items :id="activeButton" class="temperature-block" :does-change-group-name-props="false"
            :add-device-options="false" :automaticOpen="openSlide" :devices="devicesActive" :showButtonOfTurnAll="false"
            groupName="Lista uredjaja" v-memo="[devicesActive]">
            <template #icon>
                <PhFlame v-if="selectedType === 'Heating'" size="22"></PhFlame>
                <PhSnowflake v-else size="22"></PhSnowflake>
            </template>
        </group-items>
    </div>
</template>

<script setup>
import { ref, onMounted, provide, computed } from 'vue';
import groupItems from '../components/layout/GroupItems.vue';
import { useStore } from "vuex";
import { PhFlame, PhSnowflake } from '@phosphor-icons/vue';
import ButtonMy from '@/components/ui/ButtonMy.vue';
import { useToast } from 'vue-toastification';

const store = useStore();
const toast = useToast();

const isLoading = ref(false);
const activeButton = ref(0);
const devicesActive = computed(() => {
    return store.getters['device/getDeviceOfTemperatureForSelectedType'];
});
const openSlide = ref(false);
const selectedType = ref('');
provide('isSwitched', false);
provide('selectedType', selectedType);

async function getDevices(type, activeButtonParams) {
    isLoading.value = true;
    try {
        activeButton.value = activeButtonParams;
        selectedType.value = type;

        await store.dispatch('device/getAllDevicesForTemperature', selectedType.value);

        openSlide.value = true;
    } catch (error) {
        toast.error('Greška pri učitavanju uređaja', { timeout: 2000 });
        console.error('Error loading devices:', error);
    } finally {
        setTimeout(() => {
            isLoading.value = false;
        }, 300);
    }
}

onMounted(async () => {
    await getDevices('heating');
});
</script>

<style scoped>
.is-loading {
    position: relative;
    pointer-events: none;
}

.is-loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    animation: shimmer 1.5s infinite;
}

.buttons-container {
    display: flex;
    gap: 16px;
    margin-bottom: 30px;
    flex-wrap: wrap;
    justify-content: center;
}

.buttons-container button {
    width: 49%;
}

.temp-button {
    flex: 1;
    min-width: 250px;
    padding: 16px 20px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background: linear-gradient(145deg, #2e7d32, #4caf50);
    border: none;
    color: white;
    position: relative;
    overflow: hidden;
}

.temp-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
}

.temp-button:hover::before {
    left: 100%;
}

.temp-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.active-button {
    background: rgba(255, 255, 255, 0.25) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
    box-shadow:
        0 8px 32px 0 rgba(0, 0, 0, 0.37),
        0 0 20px rgba(255, 255, 255, 0.3),
        inset 0 0 20px rgba(255, 255, 255, 0.1) !important;
    transform: translateY(-2px);
}

/* Extra glow za ikonu */
.active-button :deep(svg) {
    filter: drop-shadow(0 0 8px currentColor);
    color: #ffffff;
}

/* Animacija */
.active-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}



.temperature-block {
    margin-top: 20vh;
}

@media (max-width: 800px) {
    .buttons-container button {
        width: 100%;
    }
}

@media (max-width: 600px) {
    .buttons-container {
        flex-direction: column;
    }

    .temp-button {
        min-width: 100%;
    }

    .buttons-container button {
        width: 100%;
    }
}
</style>