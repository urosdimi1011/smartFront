<template>
    <div class="push-notification">
        <ButtonMy :loading="isLoading" v-if="!isSubscribed" @click="enablePush" class="w-100">
            Omogući push notifikacije
            <template #icon>
                <Icon icon="material-symbols:notification-add-rounded" width="22" height="22" />
            </template>
        </ButtonMy>

        <ButtonMy :loading="isLoading" v-else @click="disablePush" class="w-100">
            Isključi push notifikacije
            <template #icon>
                <Icon icon="material-symbols-light:notifications-off-rounded" width="22" height="22" />
            </template>
        </ButtonMy>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { usePush } from '@/composables/usePush';
import ButtonMy from './ButtonMy.vue';
import { Icon } from '@iconify/vue';

const { isSubscribed, registerServiceWorker, subscribeUser, unsubscribeUser } = usePush();

const isLoading = ref(false);

onMounted(async () => {
    await registerServiceWorker();
});

const enablePush = async () => {
    isLoading.value = true;
    await subscribeUser();
    isLoading.value = false;

};

const disablePush = async () => {
    isLoading.value = true;
    await unsubscribeUser();
    isLoading.value = false;
};
</script>

<style scoped>
.w-100 {
    width: 100%;
}
</style>
