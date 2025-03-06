<template>
    <h2 class="mb-5">Korisnicki profil</h2>
    <div class="user-body">
        <ul>
            <li><strong>Username:</strong> {{ getUser.username }}</li>
            <li><strong>Email:</strong> {{ getUser.email }}</li>
            <li><strong>Datum registracije:</strong> {{ formattedDate(getUser.create_date) }}</li>
            <li><strong>Datum izmene:</strong> {{ formattedDate(getUser.update_date) }}</li>
        </ul>
        <ButtonMy @click="logout()" class="w-50">logout</ButtonMy>
    </div>
</template>
<script setup>
import {useStore} from 'vuex';
import { useRouter } from 'vue-router';
import { computed,defineEmits } from 'vue';
import ButtonMy from '@/components/ui/ButtonMy.vue';
import { useToast } from 'vue-toastification';
const toast = useToast();
// const route = useRoute();
const router = useRouter();
const emit = defineEmits('close');

    const store = useStore();
    const getUser = computed(()=>{
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
    const logout = async()=>{
        try{
            await store.dispatch('user/logout');
            toast.success("Uspesno ste se odjavili",{timeout: 3000});
            router.push('/login');
            emit('close');
        }
        catch(error){
            toast.error(error,{timeout: 3000});
        }
    }
</script>
<style scoped>
ul{
    list-style-type: none;
}
.w-50{
    width: 50%;
}
.mb-5{
    margin-bottom: 40px;
}
ul li{
    margin: 10px 0px;
    font-size: 20px;
}
</style>