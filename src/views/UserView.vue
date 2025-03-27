<template>
    <h2 class="mb-5">Korisnicki profil</h2>
    <div class="user-body">
        <ul>
            <li><strong>Username:</strong> {{ getUser.username }}</li>
            <li><strong>Email:</strong> {{ getUser.email }}</li>
            <li><strong>Datum registracije:</strong> {{ formattedDate(getUser.create_date) }}</li>
            <li><strong>Datum izmene:</strong> {{ formattedDate(getUser.update_date) }}</li>
            <li> <button-my @click="changePassword()">Promeni lozinku</button-my> </li>
        </ul>
        <ButtonMy @click="logout()" class="w-50">logout</ButtonMy>
        <modal-layout  title="Promeni lozinku" :modalContent="modalContent" :confirm="confirm" :visible="isOpen" @close="close()">

        </modal-layout>
    </div>
</template>
<script setup>
import {useStore} from 'vuex';
import { useRouter } from 'vue-router';
import { computed,defineEmits } from 'vue';
import modalLayout from '@/components/modalLayout.vue';
import ButtonMy from '@/components/ui/ButtonMy.vue';
import { useToast } from 'vue-toastification';
import {showModal} from "@/composables/modal";
const toast = useToast();
// const route = useRoute();
const router = useRouter();
const store = useStore();
const emit = defineEmits('close');

const { isOpen, close,show,confirm, modalContent } = showModal();
const changePassword = ()=>{
  show("Na Vas email nalog na koji ste se registrovali sticice vam zahtez za promenu lozinke. ",confirmSend)
}

const confirmSend = async ()=>{
  console.log(JSON.parse(localStorage.getItem('user')).id);
  await store.dispatch('user/changeUserPassword',JSON.parse(localStorage.getItem('user')).id);
  toast.success("Uspesno je poslata poruka, proverite email.",{
    timeout:3000
  })
}
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