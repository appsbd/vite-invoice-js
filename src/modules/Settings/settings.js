import { defineStore } from 'pinia';
import AxiosHelper from '@lib/AppsbdAxiosHelper.js';
import AppsbdURL from '@lib/AppsbdURL.js';
import { currentVersion, safeStorage, scopedKey } from '../Preview/version.js';

const module_id = 'Vite_Invoice_Settings';
let settingsSeq = 0; // a save invalidates a refresh that was already on its way

// One store for everything the Settings module saves: General (company) values and the
// per-document settings. The server answers every load and save with the full settings.
// The last settings are cached in localStorage (no personal data) so a page opens with no loader;
// they are refreshed quietly once per session.
export const useSettingsStore = defineStore('settings', {
    state: () => ({
        settingsData: {},
        settingsVersion: '',
        loading: false,
        firstLoaded: {
            settings: false,
        },
    }),
    actions: {
        async allSettings() {
            if (this.firstLoaded.settings) {
                return this.settingsData;
            }
            if (this.settingsVersion === currentVersion() && this.settingsData?.data) {
                this.firstLoaded.settings = true;
                this.refresh(); // quietly, no await
                return this.settingsData;
            }
            return this.fetchSettings();
        },
        async fetchSettings() {
            try {
                const url = AppsbdURL.get_module_url(module_id, 'get-option');
                const res = await AxiosHelper.get(url);
                if (res.data.status) {
                    this.firstLoaded.settings = true;
                    this.settingsData = res?.data;
                    this.settingsVersion = currentVersion();
                }
                return this.settingsData;
            } catch (e) {
                console.error('Failed to load settings', e);
                return null;
            }
        },
        // Replaces the cached settings with the server's, without a loader and without throwing.
        async refresh() {
            const mine = ++settingsSeq;
            try {
                const url = AppsbdURL.get_module_url(module_id, 'get-option');
                const res = await AxiosHelper.get(url);
                if (mine === settingsSeq && res?.data?.status) {
                    this.settingsData = res.data;
                    this.settingsVersion = currentVersion();
                }
            } catch (e) {
                // keep showing the cache; the next visit retries
            }
        },
        // parts = { general: {...} } and/or { documents: { invoice: {...} } }. Sent as one JSON
        // field because the framework flattens multi-line text in ordinary form fields.
        async save(parts) {
            settingsSeq++;
            const url = AppsbdURL.get_module_url(module_id, 'option');
            const res = await AxiosHelper.post(url, { payload: JSON.stringify(parts) });
            const body = res?.data;
            if (body?.status && body.data) {
                this.settingsData = { ...this.settingsData, status: true, data: body.data };
                this.settingsVersion = currentVersion();
                this.firstLoaded.settings = true;
            }
            return body;
        },
    },
    persist: { key: scopedKey('vi-settings'), storage: safeStorage('localStorage'), pick: ['settingsData', 'settingsVersion'] },
});
