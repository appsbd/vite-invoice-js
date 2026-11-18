<template>
  <div class="mt-3">
    <div>
      <ab-settings-form :on-submit="save">
        <ab-accordion multiple class="mb-3">
          <ab-accordion-item default-open>
            <template #icon="{ isOpen }">
              <AccChevron :open="isOpen" />
            </template>
            <template #title>
              <Building2 :size="16" class="me-2" />{{ t('gen.company_card') }}
              <span class="text-muted small ms-2">{{ t('gen.company_hint') }}</span>
            </template>
            <div class="">
              <template v-if="loading">
                <div v-for="i in 4" :key="i" class="mb-3">
                  <ab-skeleton style="height: 13px; width: 80px;" class="mb-2" />
                  <ab-skeleton style="height: 38px;" />
                </div>
              </template>
              <div v-else>
                <div class="vi-logo-row">
                  <div class="vi-logo-box">
                    <img v-if="logoUrl" :src="logoUrl" alt="">
                    <span v-else class="vi-logo-ph">{{ initials }}</span>
                  </div>
                  <div>
                    <div class="fw-semibold">{{ t('gen.logo') }}</div>
                    <div class="text-muted small mb-2">{{ t('gen.logo_help') }}</div>
                    <ab-button type="button" color="secondary" variant="outline" size="sm" @click="pickLogo">
                      {{ logoUrl ? t('gen.logo_change') : t('gen.logo_choose') }}
                    </ab-button>
                    <ab-button v-if="logoUrl" type="button" color="danger" variant="outline" size="sm" class="ms-2"
                      @click="removeLogo">
                      {{ t('gen.logo_remove') }}
                    </ab-button>
                  </div>
                </div>
                <div class="vi-field">
                  <ab-input-field :model-value="form.company" name="company"
                    @update:model-value="form.company = textOf($event)" :label="t('gen.company')"
                    :hints="t('gen.company_help')" rules="required" />
                </div>
                <div class="vi-field">
                  <div class="row g-3">
                    <div v-if="!labelOnly" class="col-sm-6">
                      <ab-input-field v-model="form.email" name="email" :label="t('gen.email')"
                        :hints="t('gen.email_help')" rules="email" />
                    </div>
                    <div :class="labelOnly ? 'col-12' : 'col-sm-6'">
                      <ab-input-field v-model="form.phone" name="phone" :label="t('gen.phone')" />
                    </div>
                  </div>
                </div>
                <div class="vi-field">
                  <ab-field v-model="form.address" type="textarea" name="address" :label="t('gen.address')"
                    :hints="t('gen.address_help')" />
                </div>
                <div v-if="!labelOnly" class="vi-field">
                  <ab-input-field v-model="form.tax_id" name="tax_id" :label="t('gen.tax')"
                    :placeholder="t('gen.tax_ph')" :hints="t('gen.tax_help')" />
                </div>
                <div v-if="!labelOnly" class="vi-field">
                  <ab-field v-model="form.footer" type="textarea" name="footer" :label="t('gen.footer')"
                    :hints="t('gen.footer_help')" />
                </div>
              </div>
            </div>
          </ab-accordion-item>

          <ab-accordion-item default-open>
            <template #icon="{ isOpen }">
              <AccChevron :open="isOpen" />
            </template>
            <template #title>
              <FileText :size="16" class="me-2" />{{ t('gen.pdf_card') }}
            </template>
            <div class="">
              <div v-if="!labelOnly" class="vi-field">
                <AbMultiSelect v-model="form.paper" type="select" name="paper" :label="t('gen.paper')" rules="required"
                  :hints="t('gen.paper_help')" :options="paperOptions" label-key="label" value-key="value" />
              </div>
              <div class="vi-field">
                <AbMultiSelect v-model="form.pdf_view" type="select" name="pdf_view" :label="t('gen.view')" rules="required"
                  :hints="t('gen.view_help')" :options="viewOptions" label-key="label" value-key="value" />
              </div>
            </div>
          </ab-accordion-item>
        </ab-accordion>

        <div class="d-flex justify-content-end">
          <ab-button type="submit" color="primary">{{ t('gbl.save.changes') }}</ab-button>
        </div>
      </ab-settings-form>
    </div>
    <div v-if="!docType" class="mt-3 d-flex align-items-center justify-content-between flex-wrap gap-2 p-3 border rounded">
      <div>
        <div class="fw-semibold">{{ t('setup.rerun') }}</div>
        <div class="text-muted small">{{ t('setup.rerun_help') }}</div>
      </div>
      <ab-button type="button" color="secondary" variant="outline" size="sm" @click="router.push({ name: 'setup' })">
        {{ t('setup.rerun') }}
      </ab-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, FileText } from 'lucide-vue-next'
import AccChevron from './AccChevron.vue'
import { AbSettingsForm, AbCard, AbAccordion, AbAccordionItem, AbSkeleton, AbButton, AbInputField, AbField, AbMultiSelect, useToast, translateGetMsg as t } from '@appsbd/vue3-appsbd-ui'
import { translateResponseMsg } from '@lib/lang.js'
import { useSettingsStore } from './settings.js'
import { usePreviewDraftStore } from './previewDraft.js'

// The document whose page opened this tab ('' on the General page itself). A shipping label has no email, tax number,
// footer or A4/Letter paper (it has its own label size), so those fields are not shown for it; their values stay as saved.
const props = defineProps({ docType: { type: String, default: '' } })
const labelOnly = computed(() => props.docType === 'shipping-label')
const store = useSettingsStore()
const router = useRouter()
const { toast } = useToast()
const loading = ref(false)
const paperOptions = computed(() => [{ value: 'a4', label: 'A4' }, { value: 'letter', label: t('gen.paper_letter') }])
const viewOptions = computed(() => [{ value: 'download', label: t('gen.view_download') }, { value: 'tab', label: t('gen.view_tab') }])
const form = ref({ company: '', email: '', phone: '', address: '', tax_id: '', footer: '', logo_id: 0, paper: 'a4', pdf_view: 'download' })
const logoUrl = ref('')
// The input field can hand over the raw DOM event instead of the text while typing: keep only the text.
const textOf = (v) => (typeof v === 'string' ? v : String(v?.target?.value ?? ''))
const initials = computed(() => (typeof form.value.company === 'string' ? form.value.company : '').split(/\s+/).map((w) => w.charAt(0)).join('').replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'S')

// Pick the logo from the WordPress media library (loaded by the plugin on this page).
let frame = null
function pickLogo() {
  if (!window.wp?.media) {
    toast.error(t('gen.save_failed'))
    return
  }
  if (!frame) {
    frame = window.wp.media({ title: t('gen.logo_choose'), library: { type: 'image' }, multiple: false })
    frame.on('select', () => {
      const a = frame.state().get('selection').first().toJSON()
      form.value.logo_id = a.id
      logoUrl.value = a.sizes?.medium?.url || a.url
    })
  }
  frame.open()
}
function removeLogo() {
  form.value.logo_id = 0
  logoUrl.value = ''
}

// The unsaved company details and logo go to the preview column (outside the tabs).
const draft = usePreviewDraftStore()
// Unsaved edits from before a tab switch (the tab's form is rebuilt each time): put them back after loading.
const pending = draft.general ? { general: { ...draft.general }, logoUrl: draft.logoUrl } : null
const ready = ref(false)
watch([form, logoUrl, ready], () => {
  if (!ready.value) return
  draft.general = { ...form.value }
  draft.logoUrl = logoUrl.value
}, { deep: true })

onMounted(loadSettings)

async function loadSettings() {
  loading.value = true
  const settings = await store.allSettings()
  if (settings?.status) {
    // Only the General keys: the same response also carries the per-document settings.
    form.value = Object.fromEntries(Object.keys(form.value).map((k) => [k, settings.data[k] ?? form.value[k]]))
    logoUrl.value = settings.data.logo_url || ''
  }
  if (pending) {
    form.value = { ...form.value, ...pending.general }
    if (pending.logoUrl !== null) logoUrl.value = pending.logoUrl
  }
  ready.value = true
  loading.value = false
}

async function save() {
  try {
    const res = await store.save({ general: { ...form.value } })
    // The backend sends message slugs (gbl.saved, gbl.no_update), translated here.
    const bucket = translateResponseMsg(res?.msg, res?.data) || {}
      ; (bucket.info || []).forEach(item => toast.success(item))
      ; (bucket.error || []).forEach(item => toast.error(item))
  } catch (e) {
    console.error(e)
    toast.error(t('gen.save_failed'))
  }
}
</script>

<style scoped>
.vi-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  margin-right: 6px;
}

.vi-logo-row {
  display: flex;
  gap: 16px;
  align-items: center;
  padding-bottom: 14px;
}

.vi-field {
  padding: 14px 0;
  border-top: 1px solid var(--bs-border-color, #e4e6ea);
}

.vi-field:first-child {
  padding-top: 0;
  border-top: 0;
}

.vi-field:last-child {
  padding-bottom: 0;
}

.vi-field :deep(.mb-3) {
  margin-bottom: 0 !important;
}

.vi-logo-box {
  width: 72px;
  height: 72px;
  border: 1px dashed #c3c4c7;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f6f7f9;
  flex: none;
}

.vi-logo-box img {
  max-width: 100%;
  max-height: 100%;
}

.vi-logo-ph {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #7f54b3;
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
