import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'fe37083c8df504bc35fd',
    cluster: 'eu',
    forceTLS: true,
});