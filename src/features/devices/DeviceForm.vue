<template>
    <div v-if="!check">
        <Form @submit="submit" :validation-schema="schema">
            <FormInput id="ssid" name="ssid" label="Unesite naziv (SSID) Vašeg WiFi interneta :" />
            <FormInput type="password" id="wifiPassword" name="wifiPassword"
                label="Unesite šifru Vašeg WiFi interneta :" />
            <FormInput id="name" name="name" label="Unesite naziv uredjaja: " />
            <FormInput v-model="checkedCategory" label="Izaberite kategoriju uredjaja" type="radio"
                :options="allCategories" id="id_category" name="id_category" />
            <template v-if="checkedCategory === 1">
              <label>Da li vaš uređaj podržava dimming? </label>
              <ToggleButton class="moja-klasa-za-button" name="hasBrightness" v-model="hasBrightness" size="large" onLabel="Da" offLabel="Ne" />
            </template>
            <div class="consumption-section">
                <label class="consumption-label">Da li želite da pratite potrošnju energije? </label>
                <ToggleButton class="moja-klasa-za-button" v-model="trackConsumption" size="large" onLabel="Da" offLabel="Ne" />
                
                
                <Field type="hidden" name="trackConsumption" v-model="trackConsumption" />

                <transition name="slidedown">
                    <div v-if="trackConsumption" class="consumption-settings">
                        <FormInput 
                            id="power_consumption" 
                            name="power_consumption" 
                            label="Snaga uređaja (W) - npr. 60 za sijalicu, 2000 za klimu:" 
                            type="number"
                            placeholder="0"
                        />
                    </div>
                </transition>
            </div>
            <div v-if="idGrupe">
                <FormInput id="idGrupe" name="idGrupe" type="hidden" v-model="id_group" />
            </div>
            <ButtonMy variant="secondary" class="w-30" @click.prevent="showAdvancedSettings()">
                Napredna podesavanja
                <template #icon>
                    <Icon icon="material-symbols-light:settings-outline-rounded" width="22" height="22" />
                </template>
            </ButtonMy>
            <transition name="slidedown">
                <div v-if="showAdvanced" class="advanced-settings">
                    <FormInput id="pin" name="pin" label="Pin" :model-value="2" />
                    <FormInput id="board" name="board" label="Board" :model-value="randomNumber" />
                </div>
            </transition>
          <ButtonMy variant="glass" :loading="loadingSpinner" class="form-button">
              Unesite uređaj
              <template #icon>
                <Icon icon="gridicons:add-outline" width="22" height="22" />
              </template>
          </ButtonMy>
            <p v-if="errorMsg">{{ errorMsg }}</p>
        </Form>
    </div>
    <div v-else>
        <WifiQr :tempLink="tempLink"/>
      <!-- <p>Da li ste se povezali na wi-fi smartera?</p>
      <p><strong>Napomena:</strong> Isključite mobilne podatke</p>
        <ButtonMy @click="showLink()">Da </ButtonMy> -->
    </div>

</template>
<script setup>
import * as yup from 'yup';
import { defineProps, ref, computed, onMounted } from 'vue';
import { Field, Form } from 'vee-validate';
import FormInput from '../../components/ui/FormInput.vue';
import { useStore } from 'vuex';
import ButtonMy from '@/components/ui/ButtonMy.vue';
import ToggleButton from "primevue/togglebutton";
import { Icon } from '@iconify/vue';
import WifiQr from '@/components/ui/WifiQr.vue';

const store = useStore();
const randomNumber = ref(0);
const allCategories = computed(() => {
    const categories = store.getters['category/getListOfCategories'];
    if (!categories) return [];
    
    return categories.map(cat => ({
        ...cat,
        name: getCategoryDisplayName(cat.name)
    }));
})

const getCategoryDisplayName = (categoryName) => {
    const nameMap = {
        'Light': 'Uređaji za osvetljenje',
        'Cooling': 'Uređaji za hlađenje',
        'Heating': 'Uređaji za grejanje'
    };
    return nameMap[categoryName] || categoryName;
}

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
const trackConsumption = ref(false); // NOVO
const tempLink = ref('');
const hasBrightness = ref(false);

const schema = yup.object({
    ssid: yup.string().required("Morate uneti SSID"),
    wifiPassword: yup.string().required("Morate uneti lozinku"),
    name: yup.string().required("Morate uneti ime uredjaja"),
    id_category: yup.number().required("Morate odabrati kategoriju uredjaja"),
    pin: yup.number().min(0).max(9).typeError('Pin mora biti jednocifren broj'),
    board: yup.number().min(10000, 'Board mora imati tačno 5 cifara')
    .max(99999, 'Board mora imati tačno 5 cifara')
    .typeError('Board mora biti petocifren broj'), 
    trackConsumption: yup.boolean(), 
    power_consumption: yup.number()
        .when("trackConsumption", {
            is:  (val) => {
                console.log(val);
                return val === true || val === 'true';
            },
            then: (schema) => schema.required("Morate uneti snagu").min(1, "Snaga mora biti veća od 0"),
            otherwise: (schema) => schema.notRequired()
        }),
});
const checkedCategory = ref(0);
const check = ref(false);
const loadingSpinner = ref(false);
const submit = async (values) => {
    try {
        errorMsg.value = "";
        loadingSpinner.value = true;
        let response = await store.dispatch('device/addDevice', {
            ...values,
            hasBrightness: Number(hasBrightness.value),
            trackConsumption: Number(trackConsumption.value),
            power_consumption: trackConsumption.value ? values.power_consumption : null,
        });
        loadingSpinner.value = false;
        tempLink.value = response.data.url;
        check.value = true;
        // window.location.href= tempLink;
    }
    catch (poruka) {
        errorMsg.value = poruka;
        loadingSpinner.value = false;
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
.w-30{
    width: 100%;
}
input,
button {
    padding: 10px 10px;
}

input {
    width: 100%;
    border-radius: 10px;
    outline: none;
    font-size:16px !important;
}

.form-button {
    padding: 5px 10px;
    width: 100%;
    margin-top: 25px;
}
.form-button span{
  color:#fff;
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
span{
  color:black;
  margin:0px;
}
span .p-progressspinner{
  width:35px !important;
  height: 35px !important;
}
/* Nove CSS klase */
.consumption-section {
    margin: 25px 0;
    padding: 15px;
    border-left: 4px solid #007bff;
    border-radius: 5px;
}

.consumption-label {
    display: block;
    font-size: 16px;
    margin-bottom: 10px;
    font-weight: 500;
}

.consumption-settings {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #dee2e6;
}

.hint-text {
    display: block;
    font-size: 13px;
    color: #6c757d;
    margin-top: 5px;
    margin-bottom: 15px;
    font-style: italic;
}
.moja-klasa-za-button{
    background-color: transparent !important;
}
</style>