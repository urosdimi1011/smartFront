<template>
    <div v-if="!check">
        <Form @submit="submit" :validation-schema="schema">
            <FormInput id="ssid" name="ssid" label="Unesite naziv (SSID) Vašeg WiFi interneta :" />
            <FormInput type="password" id="wifiPassword" name="wifiPassword"
                label="Unesite šifru Vašeg WiFi interneta :" />
            <FormInput id="name" name="name" label="Unesite naziv uredjaja: " />
            <!-- <FormInput type="password" id="devicePassword" name="devicePassword" label="Unesite sifru uredjaja: " /> -->
            <FormInput v-model="checkedCategory" label="Izaberite kategoriju uredjaja" type="radio"
                :options="allCategories" id="id_category" name="id_category" />

            <div v-if="idGrupe">
                <FormInput id="idGrupe" name="idGrupe" type="hidden" v-model="id_group" />
            </div>
            <button @click.prevent="showAdvancedSettings()">Napredna podesavanja</button>
            <transition name="slidedown">
                <div v-if="showAdvanced" class="advanced-settings">
                    <FormInput id="pin" name="pin" label="Pin" :model-value="2" />
                    <FormInput id="board" name="board" label="Board" :model-value="randomNumber" />
                </div>
            </transition>
            <ButtonMy class="form-button">Unesite uredjaj </ButtonMy>
            <p v-if="errorMsg">{{ errorMsg }}</p>


        </Form>
    </div>
    <div v-else>
        <p>Da li ste se povezali na wi-fi smartera?</p>
        <ButtonMy @click="showLink()">Da </ButtonMy>

    </div>

</template>
<script setup>
import * as yup from 'yup';
import { defineProps, ref, computed, onMounted } from 'vue';
import { Form } from 'vee-validate';
import FormInput from '../../components/ui/FormInput.vue';
import { useStore } from 'vuex';
import ButtonMy from '@/components/ui/ButtonMy.vue';
const store = useStore();
const randomNumber = ref(0);
const allCategories = computed(() => {
    return store.getters['category/getListOfCategories'];
})

const getAllCategories = async () => {
    await store.dispatch("category/getAll");
}
onMounted(() => {
    getAllCategories();
    genereateRandomNumber();
})
const genereateRandomNumber = () => {
    randomNumber.value = Math.floor(10000 + Math.random() * 90000);
}
const props = defineProps({
    idGrupe: Number,
    idDevice: Number
})
const errorMsg = ref('');
const showAdvanced = ref(false);
const id_group = ref(props.idGrupe);
const tempLink = ref('');

const schema = yup.object({
    ssid: yup.string().required(),
    wifiPassword: yup.string().required(),
    name: yup.string().required(),
    id_category: yup.number().required(),
    pin: yup.number().min(0).max(9).typeError('Pin mora biti jednocifren broj'),
    board: yup.number().min(10000, 'Board mora imati tačno 5 cifara')
    .max(99999, 'Board mora imati tačno 5 cifara')
    .typeError('Board mora biti petocifren broj'),  
});
const checkedCategory = ref(0);
const check = ref(false);
const submit = async (values) => {
    try {
        errorMsg.value = "";
        let response = await store.dispatch('device/addDevice', {
            ...values
        });
        tempLink.value = response.data.url;
        check.value = true;
        // window.location.href= tempLink;


    }
    catch (poruka) {
        errorMsg.value = poruka;
    }
}
const showAdvancedSettings = () => {
    showAdvanced.value = !showAdvanced.value;
}
const showLink = () => {
    window.location.href = tempLink.value;
}
</script>
<style scoped>
span {
    display: block;
    margin: 10px 0;
    color: rgba(255, 0, 0, 0.9);
}

input,
button {
    padding: 10px 10px;
}

input {
    width: 100%;
    border-radius: 10px;
    outline: none;
}

.form-button {
    color: black;
    border: 1px solid black;
    padding: 5px 10px;
}

.form-group label {
    display: block;
    font-size: 20px;
    margin-bottom: 10px;
}

.form-group {
    margin: 20px 0px;
}

.slidedown-enter-active,
.slidedown-leave-active {
    transition: max-height 0.5s ease-in-out;
}

.slidedown-enter-to,
.slidedown-leave-from {
    overflow: hidden;
    max-height: 1000px;
}

.slidedown-enter-from,
.slidedown-leave-to {
    overflow: hidden;
    max-height: 0;
}
</style>