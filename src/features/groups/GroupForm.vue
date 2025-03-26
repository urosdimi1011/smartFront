<template>
    <Form :validation-schema="schema" :initial-values="formValues" @submit="finishWithoutDevices">

        <FormInput v-model="formValues.grupaUredjaja" id="grupaUredjaja" name="grupaUredjaja" label="Nazovite novu grupu uredjaja :" />
        <!-- <div class="button-form-group">
            <button type="submit" class="form-button">Kreiraj grupu</button>
            <small>*Klikom na dugme <strong>Izaberi uredjaje</strong> možete dodati već postojace uredjaje u
                novokreiranu grupu.</small>
            <small>*Klikom na dugme <strong>Kreiraj grupu</strong>, kreirate praznu grupu a kasnije da dodate nove
                uredjaje</small>
        </div> -->
    </Form>



</template>
<script setup>
import * as yup from 'yup';
import { reactive,defineProps,onBeforeUnmount,defineEmits, watch,defineExpose } from 'vue';
import { Form } from 'vee-validate';

import FormInput from '../../components/ui/FormInput.vue';


//Za rucno validiranje!!

const schema = yup.object({
    grupaUredjaja: yup.string().required("Morate uneti ime grupe")
});
const props = defineProps({
    previousValue: {
        type: Object,
        required: false,
        default: () => ({})
    }
});


defineExpose({validate });

// const { value: grupaUredjaja } = useField('grupaUredjaja');


async function validate () {
  try {// Sinhrona validacija
     schema.validateSync(formValues);
        return {valid : true};  // Ako validacija uspe
    } catch (error) {
    return {valid : false,errors: error.errors};  // Ako validacija ne uspe
    }
}


const formValues = reactive({
  grupaUredjaja: props.previousValue.grupaUredjaja || '',
});

//OVDE TREBA ONDA DA NAPRAVIM SVOJU METODU KAO STO SAM I IMAO 

watch(formValues, (newVal)=>{
    emit('onSubmit',{...newVal,step:1});
}, {deep: true})

const emit = defineEmits('onSubmit');

onBeforeUnmount(()=>{
    emit('onSubmit',{...formValues,step:1});
});

function finishWithoutDevices() {

    // if (clickedButton.value === 'createGroup') {
    //     //Ovde ide API slanje za kreiranje samo grupe sa imenom bez dodavanja uradjaja!
    // }
    // else if (clickedButton.value === 'chooseDevices') {
    //     emit('next', values);
    // }
    console.log("Usli");
}


</script>
<style scoped>
.button-form-group small {
    color: red;

}

.button-form-group {
    display: flex;
    flex-direction: column;
}

.button-form-group button {
    margin: 10px 0px;
    width: 100%;
}

input::placeholder {
    color: rgba(0, 0, 0, 0.4);
}

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
</style>