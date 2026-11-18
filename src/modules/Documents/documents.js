import { defineStore } from 'pinia';
import AxiosHelper from '@lib/AppsbdAxiosHelper.js';
import AppsbdURL from '@lib/AppsbdURL.js';

const module_id = 'Vite_Invoice_Documents';

// No state on purpose: the list lives in the page, and Pinia's persisted state must not keep invoices.
export const useDocumentsStore = defineStore('documents', {
    actions: {
        // param = AbRequestParam (page, limit, src_by, optional with_counts = 'Y').
        // Returns { rowdata, records, page, limit, total, counts } or null; counts is { G, R, F, W } or null.
        async getList(param) {
            return this.loadGrid('data', param);
        },
        // Orders that have no invoice yet (the "Not generated" filter).
        async getWaiting(param) {
            return this.loadGrid('waiting', param);
        },
        async loadGrid(action, param) {
            try {
                const res = await AxiosHelper.post(AppsbdURL.get_module_url(module_id, action), param);
                const grid = res?.data?.data?.data ?? null;
                if (grid) {
                    grid.counts = res?.data?.data?.counts ?? null; // present when the request had with_counts
                }
                return grid;
            } catch (e) {
                console.error('Failed to load invoices', e);
                return null;
            }
        },
        // The dashboard numbers: { stats, recent, setup } or null.
        async dashboard() {
            try {
                const res = await AxiosHelper.post(AppsbdURL.get_module_url(module_id, 'dashboard'), {});
                return res?.data?.data ?? null;
            } catch (e) {
                console.error('Failed to load the dashboard', e);
                return null;
            }
        },
        // type: the document type code ('I' invoice, the default; others are made by the plugin that owns them).
        async create(order, type = 'I') {
            try {
                const res = await AxiosHelper.post(AppsbdURL.get_module_url(module_id, 'create'), { order, type });
                return res?.data ?? null;
            } catch (e) {
                return AxiosHelper.errorHandler(e);
            }
        },
        async regenerate(id) {
            try {
                const res = await AxiosHelper.post(AppsbdURL.get_module_url(module_id, 'regenerate'), { id });
                return res?.data ?? null;
            } catch (e) {
                return AxiosHelper.errorHandler(e);
            }
        },
        // disposition: 'inline' | 'attachment' (omit to follow the "When someone opens a PDF" setting).
        fileUrl(id, disposition) {
            return AppsbdURL.get_module_url(module_id, 'file') + '&id=' + encodeURIComponent(id) + (disposition ? '&d=' + disposition : '');
        },
        previewUrl(id) {
            return AppsbdURL.get_module_url(module_id, 'preview') + '&id=' + encodeURIComponent(id);
        },
    },
});
