import { openDB } from 'idb';
import {toRaw} from "vue";

const dbPromise = openDB('my-database', 1, {
    upgrade(db) {
        db.createObjectStore('storage');
    },
});

export async function setItem(key, value) {
    const db = await dbPromise;
    await db.put('storage', value, key);
}

export async function getItem(key) {
    const db = await dbPromise;
    return await db.get('storage', key);
}
export function deepToRaw(obj) {
    if (obj === null || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(deepToRaw);
    }

    const raw = {};
    for (const key in obj) {
        raw[key] = deepToRaw(toRaw(obj[key]));
    }
    return raw;
}