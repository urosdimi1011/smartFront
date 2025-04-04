import {markRaw, ref} from 'vue';

export function showModal() {
  const isOpen = ref(false);
  const modalContent = ref(null);
  const confirmCallback = ref(null);
  const show = (content = null, onConfirm = null) => {
    modalContent.value = content && typeof content === "object" ? markRaw(content) : content;
    confirmCallback.value = onConfirm;
    isOpen.value = true;
  };
  const close = () => {
    modalContent.value = null;
    confirmCallback.value = null;
    isOpen.value = false;
  };
  const confirm = () => {
    if (confirmCallback.value) confirmCallback.value();
    close();
  };
  return { isOpen,modalContent, show, close,confirm };
}