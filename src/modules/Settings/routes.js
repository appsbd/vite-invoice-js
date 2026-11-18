import { Settings } from 'lucide-vue-next';
import { isPro, customFieldsAvailable, bulkExportAvailable, cloudStorageAvailable, complianceAvailable, integrationsAvailable, licenseAvailable } from '@lib/pro.js';
import SettingsContainer from './SettingsContainer.vue';
import { DOCUMENT_TYPES, documentRouteName } from './documentTypes.js';

const meta = { icon: Settings, title: 'set.page_title', subTitle: 'set.page_subtitle' };

// The container draws the tabs and their content itself (no <router-view>), so the child routes
// only exist to give the sidebar a URL per page: /settings/general and /settings/<slug>.
const Empty = { render: () => null };

export const settingsRoute = {
  path: '/settings',
  component: SettingsContainer,
  redirect: '/settings/general',
  children: [
    { path: 'general', name: 'settings-general', component: Empty, meta },
    ...DOCUMENT_TYPES.map((t) => ({
      path: t.slug,
      name: documentRouteName(t.slug),
      component: Empty,
      meta: { ...meta, docType: t.slug },
    })),
  ],
};

// Without Pro, Pro document pages never open (typed URL, bookmark, refresh): back to Documents.
// Clicks in the sidebar and on the cards show the Pro modal and do not navigate at all.
const proSlugs = DOCUMENT_TYPES.filter((t) => t.pro).map((t) => t.slug);

export function proGuard(to) {
  if (proSlugs.includes(to.meta?.docType) && !isPro()) {
    return { name: 'documents' };
  }
  // Custom Fields need the Pro plugin: a typed URL or bookmark without it goes back to Documents.
  if (to.name === 'custom-fields' && !customFieldsAvailable()) {
    return { name: 'documents' };
  }
  // Bulk export needs the Pro plugin too.
  if (to.name === 'bulk-export' && !bulkExportAvailable()) {
    return { name: 'documents' };
  }
  // Cloud storage needs the Pro plugin too.
  if (to.name === 'storage' && !cloudStorageAvailable()) {
    return { name: 'documents' };
  }
  // Compliance (ZATCA) needs the Pro plugin too.
  if (to.name === 'compliance' && !complianceAvailable()) {
    return { name: 'documents' };
  }
  // Integrations (VitePOS) need the Pro plugin too.
  if (to.name === 'integrations' && !integrationsAvailable()) {
    return { name: 'documents' };
  }
  // The License screen shows the licensed Pro plugin's license, so it does not open without it.
  if (to.name === 'license' && !licenseAvailable()) {
    return { name: 'documents' };
  }
}
