<template>
  <AbCard>
    <template #body>
      <!-- In-page tabs: switching only swaps the form on the left. The preview is a separate column that belongs to the
         page, not to a tab, so it stays as it is. The sidebar picks the document (route.meta.docType); the :key
         rebuilds the tabs when it changes. -->
      <div class="vi-cols">
        <div>
          <ab-tabs :key="route.name" :is-route-mode="false">
            <ab-tab :title="t('set.tab.general')" :selected="onGeneral">
              <GeneralSettings :doc-type="onGeneral ? '' : type.slug" />
            </ab-tab>
            <ab-tab :title="typeText(type, 'title')" :selected="!onGeneral && !onNumbering">
              <DocumentSettings :key="type.slug" :doc-type="type.slug" />
            </ab-tab>
            <ab-tab v-if="type.numbered" :title="t('set.tab.numbering')" :selected="onNumbering">
              <DocumentSettings :key="type.slug" :doc-type="type.slug" section="numbering" />
            </ab-tab>
          </ab-tabs>
        </div>

        <PreviewDrawer>
          <ab-card show-border body-class="vi-stage">
            <template #header>
              <div class="d-flex justify-content-between align-items-center w-100">
                <span>{{ t('doc.live_preview') }}</span>
                <PreviewSourceToggle />
              </div>
            </template>
            <template #body>
              <div class="d-flex justify-content-center">
                <DocumentLivePreview :type="type.slug" :values="values" :general="draft.general"
                  :logo-url="draft.logoUrl" />
              </div>
            </template>
          </ab-card>
        </PreviewDrawer>
      </div>
    </template>
  </AbCard>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { AbTabs, AbTab, AbCard, translateGetMsg as t } from '@appsbd/vue3-appsbd-ui'
import GeneralSettings from './GeneralSettings.vue'
import DocumentSettings from './DocumentSettings.vue'
import DocumentLivePreview from '../Preview/DocumentLivePreview.vue'
import PreviewDrawer from '../Preview/PreviewDrawer.vue'
import PreviewSourceToggle from '../Preview/PreviewSourceToggle.vue'
import { usePreviewDraftStore } from './previewDraft.js'
import { getDocumentType, typeText } from './documentTypes.js'

const route = useRoute()
const draft = usePreviewDraftStore()
// On General there is no document in the route, so keep showing the last one picked (Invoice at first).
const type = ref(getDocumentType(route.meta.docType) || getDocumentType('invoice'))
watch(() => route.meta.docType, (slug) => { if (slug) type.value = getDocumentType(slug) })
const onGeneral = computed(() => !route.meta.docType)
// A link such as /settings/invoice?tab=numbering opens the Numbering tab.
const onNumbering = computed(() => !onGeneral.value && route.query.tab === 'numbering')

// The unsaved edits of this document's tabs, merged (each tab only reports the fields it changed).
const values = computed(() => {
  const merged = {}
  for (const [key, v] of Object.entries(draft.sections)) {
    if (key.startsWith(type.value.slug + ':')) Object.assign(merged, v)
  }
  return Object.keys(merged).length ? merged : null
})

onBeforeUnmount(() => draft.reset())
</script>

<style scoped>
/* Two columns without Bootstrap row margins, which made the page scroll sideways; equal width on wide screens. */
.vi-cols {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

@media (min-width: 1200px) {
  .vi-cols {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
}

/* Sticky did not hold inside the library's scrolling layout, so on wide screens each column scrolls on its own:
   the form scrolls on the left while the preview stays in view on the right. */
@media (min-width: 1200px) {
  .vi-cols {
    height: calc(100vh - 160px);
    min-height: 480px;
  }

  .vi-cols>div {
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: none;
  }

  .vi-cols>div::-webkit-scrollbar {
    display: none;
  }
}
</style>
