<template>
  <AbCard container-class="mb-0">
    <template #body>
    <div class="vi-cards mb-3">
      <div v-for="d in DOCUMENT_TYPES" :key="d.slug">
        <DocumentCard :icon="d.pro && !pro ? Lock : FileText" :title="typeText(d, 'title')"
          :description="typeText(d, 'blurb')" :pro="d.pro && !pro" :locked="d.pro && !pro" :active="!d.pro"
          :action-label="t('docs.configure')" @open="open(d)" />
      </div>
    </div>

    <h2 class="fs-6 fw-bold mb-3">{{ t('docs.extras') }}</h2>
    <div class="vi-cards">
      <div v-for="x in extras" :key="x.key">
        <DocumentCard :icon="unlocked(x) ? x.icon : Lock" :title="t(x.key + '.title')" :description="t(x.key + '.desc')"
          :pro="!unlocked(x)" :locked="!unlocked(x)" :active="false"
          :action-label="unlocked(x) ? (x.route ? t('docs.configure') : t('docs.coming_soon')) : ''"
          :disabled="unlocked(x) && !x.route" @open="openExtra(x)" />
      </div>
    </div>
    </template>
  </AbCard>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { FileText, Lock, ShieldCheck, Landmark, SlidersHorizontal } from 'lucide-vue-next'
import { isPro, customFieldsAvailable, complianceAvailable } from '@lib/pro.js'
import { AbCard, translateGetMsg as t } from '@appsbd/vue3-appsbd-ui'
import { DOCUMENT_TYPES, documentRouteName, typeText } from '@admin/modules/Settings/documentTypes.js'
import { openProModal } from './proModal.js'
import DocumentCard from './DocumentCard.vue'

const router = useRouter()
const pro = isPro()

const extras = [
  { key: 'docs.zatca', icon: ShieldCheck, route: 'compliance' },
  { key: 'docs.verifactu', icon: Landmark },
  { key: 'docs.custom_fields', icon: SlidersHorizontal, route: 'custom-fields' },
]

// An extra with a route is built (Custom Fields and Compliance, from the Pro plugin); the others are still "coming soon" even with Pro.
const available = { 'custom-fields': customFieldsAvailable(), compliance: complianceAvailable() }

const unlocked = (x) => (x.route ? available[x.route] : pro)

function openExtra(x) {
  if (x.route && available[x.route]) return router.push({ name: x.route })
  openProModal()
}

function open(d) {
  if (d.pro && !pro) return openProModal()
  router.push({ name: documentRouteName(d.slug) })
}
</script>

<style scoped>
/* Three cards per row as in the UX; two on tablets, one on phones. */
.vi-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 991px) {
  .vi-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 575px) {
  .vi-cards {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
