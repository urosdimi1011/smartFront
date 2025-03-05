<template>
    <div class="wrap-black">
        <div class="login-form">
            <!-- Za sutra taskovi kada ustanes (3 taska), zamisli da je ovo PRAVI POSAO I DA OVO MORAS DA ODRADIS!
             SAD JESAM U HAJPU I RADI MI SE ALI MORAS I OVO DA ODRADIS!!:
                + 1. Treba da kreiram laravel app, i da omogucimm dodavanje korisnika, znaci prva stvar jeste logovanje i registracija na sam sistem
                - 2. Odradi sa STOROM sve sto treba za logovanje i registraciju
                + 3. Ostalo sta da odradis je na meni (Baza da se zavrsi dizajn!!!!)
            -->
            <h1>Registruj se</h1>
            <Form @submit="submit" :validation-schema="schema">
                <FormInput name="email" label="Unesite email" />
                <FormInput name="username" label="Unesite korisnicko ime" />
                <FormInput type="password" name="password" label="Unesite lozinku" />
                <FormInput type="password" name="confPassword" label="Ponovite lozinku" />

                <strong>Imate nalog? <router-link :to="'Login'">Uloguj se</router-link></strong>

                <ButtonMy>Registruj se</ButtonMy>
                <p v-if="errorMsg">{{ errorMsg }}</p>
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
    password: yup.string().required("Morate uneti sifru").min(7),
    username: yup.string().required("Morate uneti korisnicko ime").min(7),
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
        if(poruka == 500){
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

.wrap-black {
    background-color: rgba(0, 0, 0, 0.8);
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

body {
    overflow: hidden !important;
}
</style>