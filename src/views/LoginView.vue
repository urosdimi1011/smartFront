<template>
    <div class="wrap-black">
        <div class="login-form">
            <h1>Uloguj se</h1>
            <Form @submit="submit" :validation-schema="schema">
                <FormInput name="email" label="Unesite email" />
                <FormInput type="password" name="password" label="Unesite password" />
                <strong>Nemate nalog? <router-link :to="'Register'">Registruj</router-link></strong>
                <ButtonMy class="set-width">Uloguj se</ButtonMy>
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

const store = useStore();
const errorMsg = ref('');
const schema = yup.object({
    email: yup.string().required("Morate uneti email"),
    password: yup.string().required("Morate uneti sifru").min(3,"Šifra mora biti veća od 3 karaktera"),
})

const submit = async (values) => {
    try {
        errorMsg.value = "";
        await store.dispatch('user/loginUser', {
            ...values
        });
        router.push("/");
    }
    catch (poruka) {
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
    z-index: 2;
}
.set-width{
  width: 100%;
}
body {
    overflow: hidden !important;
}
</style>