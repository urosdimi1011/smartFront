<template>
  <div>
    <!-- OVO OVDE TI JE OSTALOOO!! -->
    <!-- <p><strong>Napomena: </strong>Kada izmenite termostat, potrebno je isto da pristupite uređaju i isto tu da zamenite
      termostat</p> -->
    <Form @submit="submit" :validation-schema="schema">
      <template v-if="termostats && termostats.length > 0">
        <FormInput v-model="selectedTermosta" type="radio" :options="termostats" id="selectedTermosta"
          name="selectedTermosta" />
        <ButtonMy :disabled="!selectedTermosta" variant="glass">
          {{ idTermostat ? "Izmeni" : "Dodaj" }} termostat
          <template v-if="!idTermostat" #icon>
            <Icon icon="ic:round-add" width="24" height="24" />
          </template>
          <template v-else #icon>
            <Icon icon="material-symbols:edit-outline-rounded" width="24" height="24" />
          </template>
        </ButtonMy>
      </template>
      <template v-if="termostats && termostats.length === 0">
        <p>Trenutno nema dodatih termostata</p>
      </template>
      <template v-if="!termostats">
        <div class="spinner-layout">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
            aria-label="Custom ProgressSpinner" />
        </div>
      </template>
    </Form>
  </div>

</template>
<script setup>
import { Form } from 'vee-validate';
import { ref, onMounted, defineProps, defineEmits, inject } from 'vue';
import FormInput from '@/components/ui/FormInput.vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import ProgressSpinner from 'primevue/progressspinner';
import * as yup from "yup";
import { Icon } from '@iconify/vue';
const termostats = ref(null);
const isLoading = ref(false);
const schema = yup.object().shape({
  selectedTermosta: yup.string().required('Morate izabrati jedan termostat')
});

const props = defineProps({
  idDevice: {
    type: Number,
    required: true
  },
  idTermostat: {
    type: Number,
    required: false
  }
})
const selectedType = inject('selectedType');
const emit = defineEmits(['close']);

//Ovo smo stavili iz razloga zato sto props ne moze da se menja, a nama je props previousValue, koji sadrzi sve podatke!!!!
// const devicesChecked = ref([]);
const toast = useToast();

const store = useStore();
const selectedTermosta = ref(props.idTermostat ?? null);

async function getAllTermostat() {
  isLoading.value = true;
  try {
    const response = await store.dispatch("termostat/getAll");
    isLoading.value = false;
    setDeviceOptions(response);
  } catch (error) {
    isLoading.value = false;
    toast.error(error.message, { timeout: 3000 });
  }
}
const setDeviceOptions = (data) => {
  termostats.value = data;
}
onMounted(async () => {
  await getAllTermostat();
  // Postavljanje inicijalnih vrednosti za čekirane uređaje
})
const submit = async (values) => {
  try {
    await store.dispatch('termostat/addTermostatToDevice', { id: props.idDevice, idTermostat: values.selectedTermosta });
    toast.success("Uspesno ste povezali termostat sa uredjajem", { timeout: 3000 });
    await store.dispatch('device/getAllDevicesForTemperature', selectedType.value);
    emit('close');
  }
  catch (error) {
    toast.error(error.message, { timeout: 3000 });
  }
}

</script>
<style scoped>
span {
  display: block;
  margin: 10px 0;
  color: rgba(255, 0, 0, 0.9);
}

.form-group {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
}

.form-group input {
  padding: 10px;

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

.spinner-layout {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>