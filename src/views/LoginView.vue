<template>
    <div class="wrap-black">
        <div class="login-form">
            <h1>Uloguj se</h1>
            <Form @submit="submit" :validation-schema="schema">
                <FormInput mode="dark" name="email" label="Unesite email" />
                <FormInput mode="dark" class="text-white" type="password" name="password" label="Unesite password" />
                <div class="text-block">
                    <strong>Nemate nalog? <storng class="text-color"><router-link :to="'Register'">Registruj se</router-link></storng></strong>
                    <strong>Zaboravili ste lozinku? <storng class="text-color"><router-link :to="'reset-password'">Restatuj lozinku</router-link></storng></strong>
                </div>
                <ButtonMy variant="glass" :loading="loading" class="set-width">Uloguj se</ButtonMy>
                <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
            </Form>
        </div>

    </div>
</template>
<script setup>
import * as yup from 'yup';
import FormInput from '@/components/ui/FormInput.vue';
import { Form } from 'vee-validate';
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const router = useRouter();
console.log("RENDERRR")
const store = useStore();
const errorMsg = ref('');
const loading = ref(false);
const schema = yup.object({
    email: yup.string().required("Morate uneti email"),
    password: yup.string().required("Morate uneti sifru").min(3,"Šifra mora biti veća od 3 karaktera"),
})

const submit = async (values) => {
    try {
        errorMsg.value = "";
        loading.value=true;
        await store.dispatch('user/loginUser', {
            ...values
        });
        loading.value=false;
        router.push("/");
    }
    catch (poruka) {
        loading.value=false;
        errorMsg.value = poruka;
    }
}

</script>
<style scoped>
/* OVO PROBAJ NEKAKO DA GLOBALNO SACUVAS A NE DA SAD MORAS I DA PISES OVDE I U REGISTER */
* {
    color: white;
}

.error-msg{
  margin-top: 1em;
  color:#DC2626;
}
.wrap-black {
    background-color: rgba(0, 0, 0, 0.8);
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
}
.set-width{
  width: 100%;
}
body {
    overflow: hidden !important;
}
.text-color a{
    color: #15aff8  !important; 
}
.text-block{
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>