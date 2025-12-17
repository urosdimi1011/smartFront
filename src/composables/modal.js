import {markRaw, ref} from 'vue';

export function showModal() {
  const isOpen = ref(false);
  const modalContent = ref(null);
  const confirmCallback = ref(null);
  const modalProps = ref({});
  const modalTitle = ref('');
  
  const show = (content = null, onConfirm = null, props = {}) => {
    modalContent.value = content && typeof content === "object" ? markRaw(content) : content;
    modalProps.value = props;
    
    // Ako je prvi argument string, tretiraj ga kao naslov
    console.log('Content za modal:', content);
    if (typeof content === 'string') {
      // modalTitle.value = content;
      modalContent.value = content;
    } 
    // Ako je objekat sa component i title property-jima
    else if (content && typeof content === 'object' && content.component) {
      modalContent.value = markRaw(content.component);
      modalTitle.value = content.title || '';
      // Spoji dodatne props ako postoje
      modalProps.value = { ...props, ...content.props };
    }
    // Ako je plain komponenta, koristi naslov iz props ili prazan string
    else {
      modalTitle.value = props?.title || '';
    }
    
    confirmCallback.value = onConfirm;
    isOpen.value = true;
  };
  
  const close = () => {
    modalContent.value = null;
    confirmCallback.value = null;
    modalProps.value = {};
    modalTitle.value = '';
    isOpen.value = false;
  };
  
  const confirm = () => {
    if (confirmCallback.value) confirmCallback.value();
    close();
  };
  
  return { 
    isOpen, 
    modalContent, 
    modalProps, 
    modalTitle,
    show, 
    close, 
    confirm 
  };
}