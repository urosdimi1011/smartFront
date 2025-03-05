<template>
    <div>


        <Form @submit="submit" :validation-schema="schema">

        <!-- OVE PODATKE NECEMO DA STAVLJAMO DA KORISNIK PONOVO MORA DA UPISE, VEC CE JEDNOM KADA SE BUDE RECIMO REGISTROVAO ILI 
        NA DODAVNJU PRVOG MU SE POJAVITE I ONDA VISE NE MORA DA UNOSI ZATO STO CE MU SE ISCITAVATI IZ BAZE 
        POD TE PODATKE SPADA wifiName,password,accountName,accountPasswrod
    -->


        <FormInput id="nameOfTermostat" name="nameOfTermostat" label="Upisite naziv termostata: "/>
        <FormInput id="numberOfTermostate" name="numberOfTermostate" label="Upisite Vas redni broj termostata: "/>
        <FormInput id="locationOfSenzor" name="locationOfSenzor" label="Upisite lokaciju vaseg senzora: " />
        <!-- Ovde ce mi stajati ovo polje samo u zavisnoti koji uredjaj dodajem, dal bio za grejanje, a dal za hladjenje,
                tu cu da saljem samo id tipa uredjaja koji zelim da dodam!! 
            -->
        <FormInput id="idTipUredjajaa" name="idTipUredjajaa" type="hidden" v-model="idUredjaja" />
        <button class="form-button">Unesite termostat </button>
        </Form>
    </div>
</template>
<script setup>
import * as yup from 'yup';
import { defineProps, ref, watch, onUpdated,defineEmits,defineExpose,reactive } from 'vue';
import { useForm,Form } from 'vee-validate';
import FormInput from '../../components/ui/FormInput.vue';

const props = defineProps({
    idDevice: {
        type: Number,
        required: true
    },
    previousValue: {
        type: Object,
        required: false,
        default: () => ({})
    }
});

const formValues = reactive({
    ...props.previousValue || '',
});
const schema = yup.object({
        nameOfTermostat: yup.string().min(3,"Naziv termostata mora da sadrzi barem 3 karaktera").required("Morate staviti naziv termostata"),
        numberOfTermostate: yup.string().required("Morate dodati broj termostata"),
        locationOfSenzor: yup.string().required("Morate dodati lokaciju termostata").min(3),
});
const { validate  } = useForm({
    validationSchema: schema,
    initialValues:props.previousValue
});
const submit = (values)=>{
    console.log(values);
}
defineExpose({validate});
const emit = defineEmits('onSubmit');

// const [numberOfTermostateField, numberOfTermostateAttr] = defineField('numberOfTermostate');


onUpdated(() => {
    console.log("Usli zbog promene")
})
watch(
    formValues,
    (newValues) => {
        emit('onSubmit',{...newValues,"step":1});
        // Radi nešto kada se bilo koje polje forme promeni
    },
    { deep: true }
);

const idUredjaja = ref(props.idDevice);

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
</style>