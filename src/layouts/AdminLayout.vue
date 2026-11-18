<template>
    <ab-main-layout variation="flat">
        <template #leftSidebar>
            <ab-sidebar class="mb-2" app-unique-id="vite-invoice-admin">
                <template #header>
                    <div class="p-3 fs-5 fw-bold text-center w-100">Vite Invoice</div>
                </template>

                <ab-side-menu-item>
                    <template #sectiontitle>{{ translateGetMsg('nav.main_menu') }}</template>
                </ab-side-menu-item>

                <ab-side-menu-item to="/dashboard" icon-color="#155EEF">
                    <template #icon>
                        <LayoutDashboard />
                    </template>
                    {{ translateGetMsg('nav.dashboard') }}
                </ab-side-menu-item>

                <ab-side-menu-item to="/invoices" icon-color="#7A5AF8">
                    <template #icon>
                        <FileText />
                    </template>
                    {{ translateGetMsg('nav.invoices') }}
                </ab-side-menu-item>

                <ab-side-menu-item to="/documents" icon-color="#DD2590">
                    <template #icon>
                        <Layers />
                    </template>
                    {{ translateGetMsg('nav.documents') }}
                </ab-side-menu-item>

                <ab-side-menu-item to="/settings/general" icon-color="#667085">
                    <template #icon>
                        <Settings />
                    </template>
                    {{ translateGetMsg('nav.settings') }}
                    <template #submenu>
                        <template v-for="d in DOCUMENT_TYPES" :key="d.slug">
                            <!-- Locked (Pro type without Pro): no link, so the route never changes. -->
                            <ab-side-menu-item v-if="d.pro && !pro" href="#" @click.prevent="openProModal">
                                {{ typeText(d, 'title') }}
                                <template #nav-right>
                                    <ab-badge color="warning" size="sm">{{ translateGetMsg('gbl.pro') }}</ab-badge>
                                </template>
                            </ab-side-menu-item>
                            <ab-side-menu-item v-else :to="{ name: documentRouteName(d.slug) }"
                                :class="{ 'apbd-active': route.meta.docType === d.slug }">
                                {{ typeText(d, 'title') }}
                                <template v-if="d.pro && !pro" #nav-right>
                                    <ab-badge color="warning" size="sm">{{ translateGetMsg('gbl.pro') }}</ab-badge>
                                </template>
                            </ab-side-menu-item>
                        </template>
                    </template>
                </ab-side-menu-item>

                <ab-side-menu-item to="/templates" icon-color="#E04F16">
                    <template #icon>
                        <LayoutTemplate />
                    </template>
                    {{ translateGetMsg('nav.templates') }}
                </ab-side-menu-item>
                <ab-side-menu-item to="/emails" icon-color="#0E9384">
                    <template #icon>
                        <Mail />
                    </template>
                    {{ translateGetMsg('eml.page_title') }}
                </ab-side-menu-item>
                <ab-side-menu-item to="/email-templates" icon-color="#DC6803">
                    <template #icon>
                        <MailOpen />
                    </template>
                    {{ translateGetMsg('eml.templates_title') }}
                </ab-side-menu-item>
                <!-- Pro-only setting: without the Pro plugin it is shown disabled with the Pro badge (no link, so the route never changes). -->
                <ab-side-menu-item v-if="!customFields" href="#" class="apbd-locked-item" @click.prevent="openProModal"
                    icon-color="#444CE7">
                    <template #icon>
                        <ListPlus />
                    </template>
                    {{ translateGetMsg('cfd.page_title') }}
                    <template #nav-right>
                        <ab-badge color="warning" size="sm">{{ translateGetMsg('gbl.pro') }}</ab-badge>
                    </template>
                </ab-side-menu-item>
                <ab-side-menu-item v-else to="/custom-fields" icon-color="#444CE7">
                    <template #icon>
                        <ListPlus />
                    </template>
                    {{ translateGetMsg('cfd.page_title') }}
                </ab-side-menu-item>
                <ab-side-menu-item v-if="!bulkExport" href="#" class="apbd-locked-item" @click.prevent="openProModal"
                    icon-color="#099250">
                    <template #icon>
                        <Download />
                    </template>
                    {{ translateGetMsg('bulk.page_title') }}
                    <template #nav-right>
                        <ab-badge color="warning" size="sm">{{ translateGetMsg('gbl.pro') }}</ab-badge>
                    </template>
                </ab-side-menu-item>
                <ab-side-menu-item v-else to="/bulk" icon-color="#099250">
                    <template #icon>
                        <Download />
                    </template>
                    {{ translateGetMsg('bulk.page_title') }}
                </ab-side-menu-item>
                <ab-side-menu-item v-if="!cloudStorage" href="#" class="apbd-locked-item" @click.prevent="openProModal"
                    icon-color="#0BA5EC">
                    <template #icon>
                        <Cloud />
                    </template>
                    {{ translateGetMsg('stor.page_title') }}
                    <template #nav-right>
                        <ab-badge color="warning" size="sm">{{ translateGetMsg('gbl.pro') }}</ab-badge>
                    </template>
                </ab-side-menu-item>
                <ab-side-menu-item v-else to="/storage" icon-color="#0BA5EC">
                    <template #icon>
                        <Cloud />
                    </template>
                    {{ translateGetMsg('stor.page_title') }}
                </ab-side-menu-item>
                <ab-side-menu-item v-if="!compliance" href="#" class="apbd-locked-item" @click.prevent="openProModal"
                    icon-color="#D92D20">
                    <template #icon>
                        <ShieldCheck />
                    </template>
                    {{ translateGetMsg('cmp.page_title') }}
                    <template #nav-right>
                        <ab-badge color="warning" size="sm">{{ translateGetMsg('gbl.pro') }}</ab-badge>
                    </template>
                </ab-side-menu-item>
                <ab-side-menu-item v-else to="/compliance" icon-color="#D92D20">
                    <template #icon>
                        <ShieldCheck />
                    </template>
                    {{ translateGetMsg('cmp.page_title') }}
                </ab-side-menu-item>
                <ab-side-menu-item v-if="!integrations" href="#" class="apbd-locked-item" @click.prevent="openProModal"
                    icon-color="#66A60C">
                    <template #icon>
                        <Plug />
                    </template>
                    {{ translateGetMsg('int.page_title') }}
                    <template #nav-right>
                        <ab-badge color="warning" size="sm">{{ translateGetMsg('gbl.pro') }}</ab-badge>
                    </template>
                </ab-side-menu-item>
                <ab-side-menu-item v-else to="/integrations" icon-color="#66A60C">
                    <template #icon>
                        <Plug />
                    </template>
                    {{ translateGetMsg('int.page_title') }}
                </ab-side-menu-item>
                <!-- License: only with the licensed Pro plugin (Pro owns the license data). -->
                <ab-side-menu-item v-if="license" to="/license" icon-color="#475467">
                    <template #icon>
                        <KeyRound />
                    </template>
                    {{ translateGetMsg('lic.page_title') }}
                </ab-side-menu-item>
                <template #footer>
                    <div class="w-100 text-center vi-app-version" :title="appVersion">
                        {{ translateGetMsg('gbl.version', { version: appVersion }) }}
                    </div>
                </template>
            </ab-sidebar>
        </template>
        <template #pageHeader>
            <AdminHeader />
        </template>
        <template #body>
            <div class="p-3 pb-2">
                <router-view />

            </div>
        </template>
    </ab-main-layout>
    <ProModal v-if="proModalVisible" @close="closeProModal" />
</template>

<script setup>
import { AbMainLayout, AbSidebar, AbSideMenuItem, AbBadge, translateGetMsg } from '@appsbd/vue3-appsbd-ui';
import { Settings, Mail, MailOpen, Layers, FileText, LayoutTemplate, LayoutDashboard, ListPlus, Download, Cloud, ShieldCheck, Plug, KeyRound } from 'lucide-vue-next';
import { DOCUMENT_TYPES, documentRouteName, typeText } from '@admin/modules/Settings/documentTypes.js';
import { useRoute } from 'vue-router';
import { isPro, customFieldsAvailable, bulkExportAvailable, cloudStorageAvailable, complianceAvailable, integrationsAvailable, licenseAvailable } from '@lib/pro.js';
import { proModalVisible, openProModal, closeProModal } from '@admin/modules/Documents/proModal.js';
import ProModal from '@admin/modules/Documents/ProModal.vue';
import AdminHeader from './AdminHeader.vue';

const route = useRoute();
const pro = isPro();
const customFields = customFieldsAvailable();
const bulkExport = bulkExportAvailable();
const cloudStorage = cloudStorageAvailable();
const compliance = complianceAvailable();
const integrations = integrationsAvailable();
const license = licenseAvailable();
const appVersion = (typeof window !== 'undefined' && window.apbd_vite_invoice?.app_version) || '';
</script>

<style>
/* Keep the scrollbar space on every page, so the form column is the same width on Templates and Settings. */
html {
    scrollbar-gutter: stable;
}

/* The library sets overflow:hidden on the page body, which turns it into the sticky container and
   stops position:sticky (the settings live preview) from following the scroll. clip clips the same
   way without creating a scroll container. */
.appsbd-app .apbd-container .apbd-main-content .apbd-app-body .apbd-body {
    overflow: clip;
}

/* A Pro item without the Pro plugin: shown, but dimmed (the click opens the Pro modal). */
/* Sidebar footer version: short and small so it fits the collapsed sidebar too. */
.vi-app-version {
    font-size: 11px;
    line-height: 1.2;
    opacity: 0.7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.apbd-locked-item {
    opacity: 0.55;
}
</style>
