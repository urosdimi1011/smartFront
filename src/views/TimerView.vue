<template>
    <div class="page">
        <div class="add-timer-content">
            <Form @submit="submit" :validation-schema="schema">
                <div class="form-container">
                    <div class="form-group">
                        <label class="form-label" for="name">Naziv tajmera</label>
                        <FormInput 
                            id="name" 
                            name="name" 
                            class="form-input"
                            placeholder="Unesite naziv tajmera..."
                        />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="date">Vreme izvršavanja</label>
                        <DatePicker 
                            id="date" 
                            name="date" 
                            class="time-picker" 
                            v-model="templatedisplay" 
                            timeOnly
                            placeholder="Odaberite vreme..."
                        />
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Akcija uređaja</label>
                        <div class="toggle-container">
                            <div class="toggle-info">
                                <span class="toggle-description">Šta treba da se desi kada se tajmer pokrene?</span>
                            </div>
                            <div class="toggle-control">
                                <span class="status-text" :class="{ 'active': turn }">
                                    {{ turn ? 'Uključi uređaje' : 'Isključi uređaje' }}
                                </span>
                                <ToggleSwitch v-model="turn" name="turn" class="custom-toggle">
                                    <template #handle="{ checked }">
                                        <i :class="['toggle-icon pi', { 'pi-power-off': checked, 'pi-times': !checked }]" />
                                    </template>
                                </ToggleSwitch>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Dani -->
                    <div class="form-group">
                        <label class="form-label">Ponavljanje</label>
                        <div class="checkbox-description">Odaberite dane u sedmici kada treba da se tajmer pokrene</div>
                        <FormInput 
                            type="groupCheckBox" 
                            v-model="selectedDays" 
                            id="days" 
                            :options="days" 
                            multiSelect
                            name="days" 
                            class="checkbox-group"
                        />
                    </div>
                    
                    <!-- Uređaji -->
                    <div class="form-group">
                        <label class="form-label">Uređaji</label>
                        <div class="checkbox-description">Izaberite uređaje koji treba da se kontrolišu</div>
                        <FormInput 
                            type="groupCheckBox" 
                            v-model="devicesSelected" 
                            id="devices" 
                            :options="devicesDisplay"
                            multiSelect 
                            name="devices" 
                            class="checkbox-group"
                        />
                    </div>
                    
                    <div class="form-actions">
                        <ButtonMy :loading="isLoading" variant="glass" class="custom-button-timer" type="submit">
                            Kreiraj tajmer
                            <template #icon>
                                <Icon icon="ep:timer" width="22" height="22" />
                            </template>
                        </ButtonMy>
                    </div>
                </div>
            </Form>
        </div>
    </div>
</template>

<script setup>
import * as yup from 'yup';
import FormInput from '@/components/ui/FormInput.vue';
import DatePicker from 'primevue/datepicker';
import ToggleSwitch from 'primevue/toggleswitch';
import { computed, onMounted, ref, defineEmits, nextTick } from 'vue';
import { Form } from 'vee-validate';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import { Icon } from '@iconify/vue';

const days = ref([
    { label: "Ponedeljak", value: 1 },
    { label: "Utorak", value: 2 },
    { label: "Sreda", value: 3 },
    { label: "Četvrtak", value: 4 },
    { label: "Petak", value: 5 },
    { label: "Subota", value: 6 },
    { label: "Nedelja", value: 7 },
]);

const schema = yup.object({
    name: yup.string().required("Morate uneti ime tajmera")
});

const store = useStore();
const emit = defineEmits(['close']);
const toast = useToast();

const selectedDays = ref([]);
const devicesSelected = ref([]);
const templatedisplay = ref('');
const formHasErrors = ref(false);
const formContainerRef = ref(null);

const isLoading = ref(false);

const turn = ref(false);

const devicesDisplay = computed(() => {
    if (devicesAll.value && devicesAll.value.length) {
        return devicesAll.value.map((x) => {
            return {
                label: x.name,
                value: x.id
            }
        })
    }
    return [];
});

const getAllDevices = async () => {
     await store.dispatch("device/getAllDevices", {showGlobalLoading : false});
};

const devicesAll = computed(() => {
    return store.getters["device/getAllDevices"];
});

onMounted(() => {
    getAllDevices();
});

const submit = async (values) => {
    isLoading.value = true;
    const dataToSend = {
        "name": values.name,
        "time": templatedisplay.value.toISOString(),
        "status": turn.value,
        "idsDevice": devicesSelected.value,
        "idsDays": selectedDays.value
    };
    
    try {
        await store.dispatch("timer/setTimer", dataToSend);
        isLoading.value = false;
        toast.success("Uspešno ste dodali tajmer", {timeout: 3000});
        emit('close');
    } catch(error) {
        isLoading.value = false;
        formHasErrors.value = true;
        await nextTick();
        if (formContainerRef.value) {
            formContainerRef.value.scrollIntoView({ 
               behavior: 'smooth', 
               block: 'start'
            });
        }

       scrollToFirstError();

        toast.error(error.message, {timeout: 3000});
    }
};

const scrollToFirstError = () => {
    const firstError = document.querySelector('.error-message');
    console.log(firstError);
    if (firstError) {
        firstError.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        const input = firstError.closest('.form-group')?.querySelector('input, select, textarea');
        if (input) {
            input.focus();
        }
    }
};

</script>

<style scoped>
.custom-button-timer{
    width: 100%;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 5px;
}
.page {
    padding: 0;
    display: flex;
    justify-content: flex-start;
    background-color: transparent;
}

.add-timer-content {
    width: 100%;
    max-width: 600px;
}

.form-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    text-align: left;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
}

.form-label {
    font-size: 1rem;
    font-weight: 600;
    color: white;
    margin: 0;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.form-label::before {
    content: '';
    width: 4px;
    height: 20px;
    background: linear-gradient(135deg, #4985e6 0%, #357abd 100%);
    border-radius: 2px;
}

.checkbox-description {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    margin-top: -0.5rem;
    margin-bottom: 0.5rem;
    text-align: left;
    line-height: 1.4;
}

.toggle-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
    background: rgba(255, 255, 255, 1);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.toggle-info {
    text-align: left;
}

.toggle-description {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
}

.toggle-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.status-text {
    font-weight: 600;
    font-size: 0.95rem;
    color: white;
    transition: all 0.3s ease;
}

.status-text.active {
    color: #4ade80;
}

.form-actions {
    display: flex;
    justify-content: flex-start;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
}

.submit-button {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    border: none;
    padding: 1rem 2.5rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 200px;
    justify-content: center;
}

.submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
    background: linear-gradient(135deg, #5b52ed, #8b3ff0);
}

.submit-button:active {
    transform: translateY(0);
}

.button-icon {
    font-size: 1rem;
}

/* PrimeVue komponente stilizovanje */
:deep(.form-input input),
:deep(.time-picker .p-inputtext) {
   width: 100%;
  font-size: 16px;
  font-weight: 400;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);  
  border: 2px solid #cbd5e1 !important;
  border-radius: 8px !important;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0.025em;
  box-shadow: 
    inset 0 2px 4px 0 rgba(0, 0, 0, 0.1),
    0 4px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.form-input input:focus),
:deep(.time-picker .p-inputtext:focus) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 
    inset 0 2px 4px 0 rgba(0, 0, 0, 0.05),
    0 8px 20px 0 rgba(0, 0, 0, 0.2),
    0 0 0 3px rgba(255, 255, 255, 0.1);
}

:deep(.form-input input::placeholder),
:deep(.time-picker .p-inputtext::placeholder) {
   color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
}

:deep(.custom-toggle) {
    width: 3.5rem;
    height: 1.75rem;
}

:deep(.custom-toggle .p-toggleswitch-slider) {
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
}

:deep(.custom-toggle .p-toggleswitch-handle) {
    transition: all 0.3s ease;
}

:deep(.p-toggleswitch .p-toggleswitch-handle) {
    transition: inset-inline-end 0.3s ease, inset-inline-start 0.3s ease !important;
}

:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle) {
    inset-inline-start: auto !important;
    inset-inline-end: 0.125rem !important;
}

:deep(.custom-toggle.p-highlight .p-toggleswitch-handle) {
    right: 0.125rem !important;
}

:deep(.custom-toggle.p-highlight .p-toggleswitch-slider) {
    background: linear-gradient(135deg, #4ade80, #22c55e);
    border-color: #4ade80;
}

:deep(.toggle-icon) {
    font-size: 0.75rem;
    color: #ffffff;
}

:deep(.checkbox-group) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
    padding: 1rem;
    /* background: rgba(255, 255, 255, 0.03); */
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Error states */
:deep(.form-group .error-message) {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    text-align: left;
}


:deep(.custom-toggle.p-highlight .p-toggleswitch-handle) {
    inset-inline-start: calc(100% - var(--handle-size) - var(--slider-padding)) !important;
}   

/* Responsive design */
@media (max-width: 768px) {

    .form-container {
        gap: 1.5rem;
    }
    
    .toggle-container {
        padding: 1rem;
    }
    
    .toggle-control {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
    
    .submit-button {
        width: 100%;
        padding: 1.125rem 2rem;
    }
    
    :deep(.checkbox-group) {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }
}

@media (max-width: 480px) {
    .add-timer-content {
        padding: 1rem;
    }
    
    .form-container {
        gap: 1.25rem;
    }
    
    .form-label {
        font-size: 0.9rem;
    }
    
    .checkbox-description {
        font-size: 0.8rem;
    }
}

/* Dark mode enhancements (već imate bazni dark mode) */
@media (prefers-color-scheme: dark) {
    .add-timer-content {
        background: rgba(0, 41, 62, 0.4);
        border-color: rgba(255, 255, 255, 0.15);
    }
    
    .toggle-container {
        background: rgba(0, 41, 62, 0.3);
        border-color: rgba(255, 255, 255, 0.15);
    }
    
    :deep(.checkbox-group) {
        background: rgba(0, 41, 62, 0.2);
        border-color: rgba(255, 255, 255, 0.1);
    }
}
</style>