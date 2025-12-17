import { PhLightbulb, PhLightbulbFilament, PhPlugs, PhPlugsConnected } from "@phosphor-icons/vue";
import { markRaw } from "vue";

export enum DeviceCategory {
  PLUG = 'Plug',
  LIGHT = 'Light',
  FAN = 'Fan',
  THERMOSTAT = 'Thermostat'
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ERROR = 'error'
}

// Mapiranje ikona po kategoriji i statusu
export const DEVICE_ICONS = {
  [DeviceCategory.PLUG]: {
    on: markRaw(PhPlugsConnected),
    off: markRaw(PhPlugs),
    default: markRaw(PhPlugs)
  },
  [DeviceCategory.LIGHT]: {
    on: markRaw(PhLightbulb),
    off: markRaw(PhLightbulbFilament),
    default: markRaw(PhLightbulb)
  }

} as const;