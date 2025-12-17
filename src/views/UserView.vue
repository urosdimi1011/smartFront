<template>
    <div class="user-body">
        <ul>
            <li><strong>Username:</strong> {{ getUser.username }}</li>
            <li><strong>Email:</strong> {{ getUser.email }}</li>
            <li><strong>Datum registracije:</strong> {{ formattedDate(getUser.create_date) }}</li>
            <li><strong>Datum izmene:</strong> {{ formattedDate(getUser.update_date) }}</li>
        </ul>
        <div class="flex">
            <ButtonMy :loading="loading" :disabled="loading" variant="glass" @click="logout()">Izloguj se
                <template #icon>
                    <Icon icon="ic:round-logout" width="22" height="22" />
                </template>
            </ButtonMy>
        </div>
        <modal-layout title="Promeni lozinku" :modalContent="modalContent" :confirm="confirm" :visible="isOpen"
            @close="close()" />
    </div>
</template>
<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { computed, defineEmits, ref } from 'vue';
import modalLayout from '@/components/modalLayout.vue';
import ButtonMy from '@/components/ui/ButtonMy.vue';
import { useToast } from 'vue-toastification';
import { showModal } from "@/composables/modal";
import { Icon } from '@iconify/vue';
const toast = useToast();
// const route = useRoute();
const router = useRouter();
const loading = ref(false);
const store = useStore();
const emit = defineEmits('close');

const { isOpen, close, confirm, modalContent } = showModal();
// const changePassword = ()=>{
//   show("Na Vas email nalog na koji ste se registrovali sticice vam zahtez za promenu lozinke. ",confirmSend)
// }

const confirmSend = async () => {
    try {
        loading.value = true;
        const response = await store.dispatch('user/changeUserPassword', { idUser: JSON.parse(localStorage.getItem('user')).id });
        toast.success(response.message, {
            timeout: 3000
        })
        emit('close');
        loading.value = false;
    }
    catch (error) {
        loading.value = false;
        if (error.response && error.response.data && error.response.data.message) {
            toast.error(error.response.data.message, {
                timeout: 3000
            });
        } else if (error.message) {
            toast.error(error.message, {
                timeout: 3000
            });
        } else {
            toast.error('Došlo je do nepoznate greške', {
                timeout: 3000
            });
        }
    }

}
const getUser = computed(() => {
    return store.getters['user/getUser'];
});
const formattedDate = (date) => {
    const datum = new Date(date);
    return datum.toLocaleDateString('sr-RS', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
const logout = async () => {
    loading.value = true;
    try {
        await store.dispatch('user/logout');
        loading.value = false;
        toast.success("Uspesno ste se odjavili", { timeout: 3000 });
        router.push('/login');
        emit('close');
    }
    catch (error) {
        loading.value = false;
        toast.error(error, { timeout: 3000 });
    }
}
</script>
<style scoped>
ul {
    list-style-type: none;
}

.w-50 {
    width: 50%;
}

.mb-5 {
    margin-bottom: 40px;
}

ul li {
    margin: 10px 0px;
    font-size: 20px;
}

.flex {
    display: flex;
    gap: 10px;
}
</style>