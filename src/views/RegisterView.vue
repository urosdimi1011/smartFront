<template>
    <div class="wrap-black">
        <div class="login-form">
            <h1>Registruj se</h1>
            <Form @submit="submit" :validation-schema="schema">
                <FormInput name="email" label="Unesite email" />
                <FormInput name="username" label="Unesite korisnicko ime" />
                <FormInput type="password" name="password" label="Unesite lozinku" />
                <FormInput type="password" name="confPassword" label="Ponovite lozinku" />
                <strong>Imate nalog? <router-link :to="'Login'">Uloguj se</router-link></strong>
                <ButtonMy>Registruj se</ButtonMy>
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
const errorMsg = ref('');
const store = useStore();

const schema = yup.object({
    email: yup.string().required("Morate uneti email").min(7),
    password: yup.string().required("Morate uneti sifru").min(4,"Šifra mora biti veća od 3 karaktera"),
    username: yup.string().required("Morate uneti korisnicko ime"),
    confPassword: yup.string().required("Morate ponoviti istu sifru")
        .oneOf([yup.ref('password')], 'Lozinke se ne poklapaju')
})

const submit = async (values) => {
    try {
        errorMsg.value = "";
        await store.dispatch('user/registerUser', {
            ...values
        });
        router.push("/login");
    }
    catch (poruka) {
        if(poruka === 500){
            errorMsg.value = "Email sa takvim nazivom vec postoji u bazi";
        }
        else{
            errorMsg.value = poruka;
        }
    }
}

</script>
<style scoped>
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
    z-index: 2;
}

body {
    overflow: hidden !important;
}
</style>