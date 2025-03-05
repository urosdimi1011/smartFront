import { createStore } from 'vuex'
import user from './modules/user';
import device from './modules/device';
import group from './modules/groups';
import timer from './modules/timer';
import category from './modules/category';
import termostat from './modules/termostat';
export default createStore({
  modules: {
    user,
    device,
    group,
    timer,
    category,
    termostat
  }
})
