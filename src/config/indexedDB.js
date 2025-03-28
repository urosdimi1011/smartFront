import { openDB } from 'idb';

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
