import { defineStore } from 'pinia';
import { DOCUMENT_TYPES } from './documentTypes.js';
import { useSettingsStore } from './settings.js';

// Per-document settings. Saved on the server (Vite_Invoice_Settings); this store only merges the
// saved values over the defaults in documentTypes.js so a new field never comes back undefined.
export const useDocumentSettingsStore = defineStore('documentSettings', {
    actions: {
        defaults(slug) {
            return { ...DOCUMENT_TYPES.find((x) => x.slug === slug).defaults };
        },
        async load(slug) {
            const settings = await useSettingsStore().allSettings();
            const saved = settings?.data?.documents?.[slug] || {};
            const values = { ...this.defaults(slug), ...saved };
            // Stores saved before the status list existed hold a single `trigger`: read it as the list.
            if (slug === 'invoice') {
                if (!('triggers' in saved) && typeof saved.trigger === 'string') values.triggers = [saved.trigger];
                delete values.trigger;
            }
            return values;
        },
        // Returns the server response ({ status, msg, data }).
        async save(slug, values) {
            return useSettingsStore().save({ documents: { [slug]: values } });
        },
    },
});
