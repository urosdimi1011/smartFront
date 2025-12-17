import { ref } from 'vue';
import api from "@/config/axios";

export const usePush = () => {
  const isSubscribed = ref(false);
  const swRegistration = ref(null);

  // Registracija service workera
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        swRegistration.value = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');

        const subscription = await swRegistration.value.pushManager.getSubscription();
        isSubscribed.value = !!subscription;
        return subscription;
      } catch (err) {
        console.error('Service Worker registration failed', err);
      }
    } else {
      console.warn('Push notifications are not supported');
    }
  };

  // Pretplata korisnika
  const subscribeUser = async () => {
    try {
      const subscription = await swRegistration.value.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.VUE_APP_VAPID_PUBLIC_KEY)
      });

      // Pošalji subscription na backend
      await api.post('/api/push/subscribe', subscription);

      isSubscribed.value = true;
      console.log('User subscribed for push notifications');
    } catch (err) {
      console.error('Push subscription failed', err);
    }
  };

  // Helper za konverziju VAPID ključa
  function urlBase64ToUint8Array(base64String) {
    console.log(base64String);
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
  }
const unsubscribeUser = async () => {
  if (!swRegistration.value) return;

  try {
    const subscription = await swRegistration.value.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();

        await api.post('/api/push/unsubscribe', subscription, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

      isSubscribed.value = false;
      console.log('User unsubscribed from push notifications');
    }
  } catch (err) {
    console.error('Unsubscribe failed', err);
  }
};
  return { isSubscribed, registerServiceWorker, subscribeUser,unsubscribeUser };
};
