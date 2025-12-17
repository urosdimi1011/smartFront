<template>
    <div class="wrap-black">
        <div class="login-form">
            <h1>Restatuj lozinku</h1>
            <template v-if="hasCode === false">
                <Form @submit="submit" :validation-schema="schema">
                    <FormInput mode="dark" name="email" label="Unesite email" />
                    <div class="text-block">
                        <strong>Imate nalog? <storng class="text-color"><router-link :to="'Login'">Uloguj se</router-link></storng></strong>
                    </div>
                    <ButtonMy variant="glass" :loading="loading" class="set-width">Pošalji zahtev na email</ButtonMy>
                    <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
                    <p class="link" @click="changeCodeToTrue()">Dobili ste kod?</p>
                </Form>
            </template>
            <template v-if="hasCode===true">
                <Form @submit="submit2" :validation-schema="schema2">
                    <FormInput mode="dark" name="email" label="Unesite email ponovo" />
                    <FormInput mode="dark" name="token" label="Unesite kod koji ste dobili na email" />

                    <ButtonMy variant="glass" :loading="loading" class="set-width">Validiraj</ButtonMy>
                    <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
                    <p class="link" @click="changeCodeToFalse()">Niste dobili kod?</p>
                </Form>
            </template>

            <template v-if="hasValideCode">
                <Form @submit="submit3" :validation-schema="schema3">
                    <FormInput mode="dark" name="password" label="Unesite novu lozinku" />
                    <FormInput mode="dark" name="confPassword" label="Potvrdite lozinku" />

                    <ButtonMy variant="glass" :loading="loading" class="set-width">Restatuj lozinku</ButtonMy>
                    <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
                </Form>
            </template>
            
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
import {useToast} from "vue-toastification";

const router = useRouter();

const store = useStore();
const errorMsg = ref('');
const loading = ref(false);
const hasCode = ref(false);
const hasValideCode = ref(false);
const toast = useToast();
const insertedEmail = ref('');
const userEmail  = ref('');
const schema = yup.object({
    email: yup.string().required("Morate uneti email"),
})
const schema2 = yup.object({
    email: yup.string().required("Morate uneti email"),
    token:  yup.string()
            .required("Token je obavezan")
            .min(8, "Token mora imati najmanje 8 karaktera")
            .matches(/^[A-Z0-9]+$/, "Token može sadržavati samo velika slova i brojeve")
})
const schema3 = yup.object({
    password: yup.string().required("Morate uneti lozinku"),
    confPassword: yup.string().required("Morate ponoviti istu sifru")
        .oneOf([yup.ref('password')], 'Lozinke se ne poklapaju')
})

const changeCodeToTrue =()=>{
    hasCode.value = true;
};

const changeCodeToFalse = ()=>{
    hasCode.value = false;
}

const submit = async (values) => {
    try {
        userEmail.value='';
        errorMsg.value = "";
        loading.value=true;
        await store.dispatch('user/changeUserPassword', {
            ...values
        });
        loading.value=false;
        toast.success(`Poruka je uspesno poslata na email: ${values.email}`,{
            timeout:3000
        })
        userEmail.value = values.email;
        insertedEmail.value = values.email;
    }
    catch (poruka) {
        userEmail.value='';
        loading.value=false;
        errorMsg.value = poruka.response.data.message;
    }
}
const submit2 = async(values)=>{
    try {
        userEmail.value = '';
        errorMsg.value = "";
        loading.value=true;
        const isValidated = await store.dispatch('user/validateToken', values);

        hasValideCode.value = isValidated.data.valid;
        userEmail.value = values.email;
        hasCode.value = null;
        loading.value=false;
    }
    catch (poruka) {
        userEmail.value = '';
        loading.value=false;
        errorMsg.value = 'Kod nije validan!';
    }
}
const submit3 = async(values)=>{
      try {
        errorMsg.value = "";
        loading.value=true;

        const dataForSend = {
            password : values.password,
            email:userEmail.value
        }

        const response = await store.dispatch('user/changePassword', dataForSend);
        toast.success(response.data.message,{
            timeout:3000
        });
        loading.value=false;
        router.push('/login');
    }
    catch (xhr) {
        loading.value=false;
        errorMsg.value = xhr.response.data.message;
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
.link{
    margin-top: 20px;
    /* color: */
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