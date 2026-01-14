/**
 * Storage Module - LocalStorage Wrapper
 */

const KEY = 'hydro_history_v1';
const MAX_ITEMS = 20;

export const Storage = {
    save: (entry) => {
        try {
            const raw = localStorage.getItem(KEY);
            const list = raw ? JSON.parse(raw) : [];

            // Add new at start
            list.unshift(entry);

            // Trim
            if (list.length > MAX_ITEMS) {
                list.splice(MAX_ITEMS);
            }

            localStorage.setItem(KEY, JSON.stringify(list));
            return list;
        } catch (e) {
            console.error("Storage error", e);
            return [];
        }
    },

    load: () => {
        try {
            const raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    },

    clear: () => {
        localStorage.removeItem(KEY);
    }
};
