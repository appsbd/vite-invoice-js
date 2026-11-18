<template>
  <div class="mt-3">
    <div>
      <ab-settings-form v-if="!loading" :key="type.slug" :on-submit="save">
        <ab-accordion v-if="!numberingOnly" multiple class="mb-3">
          <!-- When to create it -->
          <ab-accordion-item default-open>
            <template #icon="{ isOpen }">
              <AccChevron :open="isOpen" />
            </template>
            <template #title>
              <Zap :size="16" class="me-2" />{{ isInvoice ? t('doc.when_invoice') : t('doc.when_other') }}
              <ab-badge v-if="type.pro && !pro" color="warning" size="sm" class="ms-2">{{ t('gbl.pro') }}</ab-badge>
            </template>
            <div class="">
              <AbToggle containerClass="mb-3" name="auto" id="auto" true-value="Y" false-value="N" v-model="form.auto">
                <template #label>{{ t('doc.auto') }}</template>
                <template #description>
                  {{ hasPackRows || isLabel || isProforma ? t('doc.auto_status_help', { name: docName }) : isInvoice ? t('doc.auto_invoice_help') : typeText(type, 'trigger') + '.' }}
                </template>
              </AbToggle>

              <div v-if="(isInvoice || isProforma || hasPackRows || isLabel) && form.auto === 'Y'" class="vi-field">
                <ab-field v-model="form.triggers" type="multiselect" name="triggers" :label="hasPackRows || isLabel || isProforma ? t('doc.trigger_doc', { name: docName }) : t('doc.trigger')"
                  rules="required" :hints="t('doc.trigger_help')" :options="triggerChoices" label-key="label" value-key="value"
                  :placeholder="t('doc.trigger_ph')" />
              </div>

              <AbToggle v-if="hasPackRows || isProforma" containerClass="mb-3" name="customerDownload" id="customerDownload" true-value="Y"
                false-value="N" v-model="form.customerDownload">
                <template #label>{{ t('doc.slip_customer') }}</template>
                <template #description>
                  {{ isProforma ? t('doc.pf_customer_help') : (isSlip ? t('doc.slip_customer_help') : t('doc.dn_customer_help')) }}
                </template>
              </AbToggle>

              <template v-if="isInvoice">
                <AbToggle containerClass="mb-3" name="manual" id="manual" true-value="Y" false-value="N" v-model="form.manual">
                  <template #label>{{ t('doc.manual') }}</template>
                  <template #description>{{ t('doc.manual_help') }}</template>
                </AbToggle>

                <AbToggle containerClass="mb-3" name="customerDownload" id="customerDownload" true-value="Y" false-value="N" v-model="form.customerDownload">
                  <template #label>{{ t('doc.customer_dl') }}</template>
                  <template #description>{{ t('doc.customer_dl_help') }}</template>
                </AbToggle>

                <AbToggle containerClass="mb-3" name="skipFree" id="skipFree" true-value="Y" false-value="N" v-model="form.skipFree">
                  <template #label>{{ t('doc.skip_free') }}</template>
                  <template #description>{{ t('doc.skip_free_help') }}</template>
                </AbToggle>

                <div class="vi-field">
                  <ab-field v-model="form.skipStatuses" type="multiselect" name="skipStatuses"
                    :label="t('doc.skip_statuses')" :hints="t('doc.skip_statuses_help')" :options="statusOptions"
                    label-key="label" value-key="value" :placeholder="t('doc.skip_ph')" />
                </div>
              </template>

              <AbToggle v-if="'email' in form && !isProforma" containerClass="mb-3" name="email" id="email" true-value="Y" false-value="N" v-model="form.email">
                <template #label>{{ t('doc.email') }}</template>
                <template #description>{{ t('doc.email_help', { name: typeText(type, 'title') }) }}</template>
              </AbToggle>

              <div v-if="'size' in form" class="vi-field">
                <AbMultiSelect v-model="form.size" type="select" name="size" rules="required" :label="t('doc.label_size')"
                  :hints="t('doc.label_size_help')" :options="sizeOptions" label-key="label" value-key="value" />
              </div>
            </div>
          </ab-accordion-item>

          <!-- Proforma: optional email when it is created automatically -->
          <ab-accordion-item v-if="isProforma">
            <template #icon="{ isOpen }">
              <AccChevron :open="isOpen" />
            </template>
            <template #title>
              <Mail :size="16" class="me-2" />{{ t('doc.pf_email_card') }}
            </template>
            <div class="">
              <AbToggle containerClass="mb-3" name="emailAuto" id="emailAuto" true-value="Y" false-value="N" v-model="form.emailAuto">
                <template #label>{{ t('doc.pf_email_auto') }}</template>
                <template #description>{{ t('doc.pf_email_auto_help') }}</template>
              </AbToggle>
              <p class="small mb-2"><router-link to="/email-templates">{{ t('doc.pf_email_edit') }}</router-link></p>
            </div>
          </ab-accordion-item>

          <!-- Show on the invoice -->
          <ab-accordion-item v-if="isInvoice || isProforma || isCredit">
            <template #icon="{ isOpen }">
              <AccChevron :open="isOpen" />
            </template>
            <template #title>
              <Eye :size="16" class="me-2" />{{ isCredit ? t('doc.show_on', { name: docName }) : t('doc.show_card') }}
            </template>
            <div class="">
              <AbToggle containerClass="mb-3" name="showSku" id="showSku" true-value="Y" false-value="N" v-model="form.showSku">
                <template #label>{{ t('doc.sku') }}</template>
                <template #description>{{ t('doc.sku_help') }}</template>
              </AbToggle>

              <AbToggle containerClass="mb-3" name="showTax" id="showTax" true-value="Y" false-value="N" v-model="form.showTax">
                <template #label>{{ t('doc.tax_line') }}</template>
                <template #description>{{ t('doc.tax_line_help') }}</template>
              </AbToggle>

              <AbToggle v-if="!isCredit" containerClass="mb-3" name="showShipping" id="showShipping" true-value="Y" false-value="N" v-model="form.showShipping">
                <template #label>{{ t('doc.shipping_line') }}</template>
                <template #description>{{ t('doc.shipping_line_help') }}</template>
              </AbToggle>

              <AbToggle containerClass="mb-3" name="showPayment" id="showPayment" true-value="Y" false-value="N" v-model="form.showPayment">
                <template #label>{{ t('doc.payment') }}</template>
                <template #description>{{ t('doc.payment_help') }}</template>
              </AbToggle>

              <AbToggle containerClass="mb-3" name="showEmail" id="showEmail" true-value="Y" false-value="N" v-model="form.showEmail">
                <template #label>{{ t('doc.show_email') }}</template>
                <template #description>{{ t('doc.show_email_help') }}</template>
              </AbToggle>

              <AbToggle containerClass="mb-3" name="showPhone" id="showPhone" true-value="Y" false-value="N" v-model="form.showPhone">
                <template #label>{{ t('doc.show_phone') }}</template>
                <template #description>{{ t('doc.show_phone_help') }}</template>
              </AbToggle>

              <AbToggle v-if="!isCredit" containerClass="mb-3" name="showNotes" id="showNotes" true-value="Y" false-value="N" v-model="form.showNotes">
                <template #label>{{ t('doc.show_notes') }}</template>
                <template #description>{{ t('doc.show_notes_help') }}</template>
              </AbToggle>

              <div :class="{ 'opacity-50 cursor-pointer': !pro }" @click="!pro && openProModal()">
                <AbToggle containerClass="mb-3" name="showImage" id="showImage" true-value="Y" false-value="N" v-model="form.showImage" :disabled="!pro">
                  <template #label>
                    {{ t('doc.show_image') }}
                    <ab-badge v-if="!pro" color="warning" size="sm" class="ms-1">{{ t('gbl.pro') }}</ab-badge>
                  </template>
                  <template #description>{{ t('doc.show_image_help') }}</template>
                </AbToggle>
              </div>

              <div v-if="!isCredit" :class="{ 'opacity-50 cursor-pointer': !customFields }" @click="!customFields && openProModal()">
                <AbToggle containerClass="mb-3" name="showCustom" id="showCustom" true-value="Y" false-value="N" v-model="form.showCustom" :disabled="!customFields">
                  <template #label>
                    {{ t('doc.show_custom') }}
                    <ab-badge v-if="!customFields" color="warning" size="sm" class="ms-1">{{ t('gbl.pro') }}</ab-badge>
                  </template>
                  <template #description>{{ t('doc.show_custom_help') }}</template>
                </AbToggle>
              </div>

              <div :class="{ 'opacity-50 cursor-pointer': !pro }" @click="!pro && openProModal()">
                <AbToggle containerClass="mb-3" name="showQr" id="showQr" true-value="Y" false-value="N" v-model="form.showQr" :disabled="!pro">
                  <template #label>
                    {{ t('doc.show_qr') }}
                    <ab-badge v-if="!pro" color="warning" size="sm" class="ms-1">{{ t('gbl.pro') }}</ab-badge>
                  </template>
                  <template #description>{{ t('doc.show_qr_help') }}</template>
                </AbToggle>
              </div>

              <div class="vi-field">
                <AbMultiSelect v-model="form.shipAddr" type="select" name="shipAddr" rules="required" :label="t('doc.ship_addr')"
                  :hints="t('doc.ship_addr_help')" :options="addrOptions" label-key="label" value-key="value" />
              </div>
              <div v-if="!isCredit" class="vi-field">
                <AbMultiSelect v-model="form.dateSource" type="select" name="dateSource" rules="required" :label="t('doc.date_shown')"
                  :hints="t('doc.date_shown_help')" :options="dateOptions" label-key="label" value-key="value" />
              </div>

              <AbToggle v-if="!isCredit" containerClass="mb-3" name="showDue" id="showDue" true-value="Y" false-value="N" v-model="form.showDue">
                <template #label>{{ t('doc.due') }}</template>
                <template #description>{{ t('doc.due_help') }}</template>
              </AbToggle>

              <div v-if="form.showDue === 'Y'" class="vi-field">
                <ab-input-field v-model="form.dueDays" name="dueDays" :label="t('doc.due_days')"
                  :hints="t('doc.due_days_help')" rules="required|numeric" />
              </div>
            </div>
          </ab-accordion-item>

          <!-- Shipping Label: the codes it prints -->
          <ab-accordion-item v-if="isLabel">
            <template #icon="{ isOpen }">
              <AccChevron :open="isOpen" />
            </template>
            <template #title>
              <Eye :size="16" class="me-2" />{{ t('doc.label_card') }}
            </template>
            <div class="">
              <AbToggle containerClass="mb-3" name="showBarcode" id="showBarcode" true-value="Y" false-value="N" v-model="form.showBarcode">
                <template #label>{{ t('doc.label_barcode') }}</template>
                <template #description>{{ t('doc.label_barcode_help') }}</template>
              </AbToggle>

              <AbToggle containerClass="mb-3" name="showQr" id="showQr" true-value="Y" false-value="N" v-model="form.showQr">
                <template #label>{{ t('doc.label_qr') }}</template>
                <template #description>{{ t('doc.label_qr_help') }}</template>
              </AbToggle>
            </div>
          </ab-accordion-item>

          <!-- Packing Slip and Delivery Note: what the document shows -->
          <ab-accordion-item v-if="hasPackRows">
            <template #icon="{ isOpen }">
              <AccChevron :open="isOpen" />
            </template>
            <template #title>
              <Eye :size="16" class="me-2" />{{ t('doc.show_on', { name: docName }) }}
            </template>
            <div class="">
              <AbToggle containerClass="mb-3" name="prices" id="prices" true-value="Y" false-value="N" v-model="form.prices">
                <template #label>{{ t('doc.prices') }}</template>
                <template #description>{{ t('doc.prices_help') }}</template>
              </AbToggle>

              <div class="vi-field">
                <AbMultiSelect v-model="form.billAddr" type="select" name="billAddr" rules="required" :label="t('doc.bill_addr')"
                  :hints="t('doc.bill_addr_help')" :options="addrOptions" label-key="label" value-key="value" />
              </div>

              <AbToggle v-if="isSlip" containerClass="mb-3" name="showPhone" id="showPhone" true-value="Y" false-value="N" v-model="form.showPhone">
                <template #label>{{ t('doc.show_phone') }}</template>
                <template #description>{{ t('doc.show_phone_help') }}</template>
              </AbToggle>

              <AbToggle containerClass="mb-3" name="showNotes" id="showNotes" true-value="Y" false-value="N" v-model="form.showNotes">
                <template #label>{{ t('doc.show_notes') }}</template>
                <template #description>{{ t('doc.show_notes_help') }}</template>
              </AbToggle>

              <AbToggle containerClass="mb-3" name="showSku" id="showSku" true-value="Y" false-value="N" v-model="form.showSku">
                <template #label>{{ t('doc.sku') }}</template>
                <template #description>{{ t('doc.sku_help') }}</template>
              </AbToggle>

              <AbToggle containerClass="mb-3" name="showImage" id="showImage" true-value="Y" false-value="N" v-model="form.showImage">
                <template #label>{{ t('doc.show_image') }}</template>
                <template #description>{{ t('doc.show_image_help') }}</template>
              </AbToggle>

              <AbToggle containerClass="mb-3" name="showShipMethod" id="showShipMethod" true-value="Y" false-value="N" v-model="form.showShipMethod">
                <template #label>{{ t('doc.show_ship_method') }}</template>
                <template #description>{{ t('doc.show_ship_method_help') }}</template>
              </AbToggle>

              <AbToggle containerClass="mb-3" name="showCustom" id="showCustom" true-value="Y" false-value="N" v-model="form.showCustom">
                <template #label>{{ t('doc.show_custom') }}</template>
                <template #description>{{ t('doc.show_custom_help') }}</template>
              </AbToggle>

              <div class="vi-field">
                <ab-field v-model="form.note" type="textarea" name="note" :label="isSlip ? t('doc.pack_note') : t('doc.delivery_msg')"
                  :hints="isSlip ? t('doc.pack_note_help') : t('doc.delivery_msg_help')" />
              </div>
            </div>
          </ab-accordion-item>

        </ab-accordion>

        <!-- Numbering tab -->
        <ab-card v-if="type.numbered && numberingOnly" show-border container-class="mb-3">
          <template #header>{{ isInvoice ? t('doc.num_invoice') : t('doc.num_other') }}</template>
          <template #body>
            <div class="alert alert-warning small py-2">{{ t('doc.num_warn') }}</div>
            <p v-if="!isInvoice" class="text-muted small">{{ t('doc.num_own') }}</p>
            <p class="text-muted small">{{ t('doc.num_placeholders') }}</p>
            <div class="row">
              <div class="col-sm-6">
                <ab-input-field v-model="form.prefix" name="prefix" :label="t('doc.prefix')"
                  :hints="t('doc.prefix_help')" rules="max:20" />
              </div>
              <div class="col-sm-6">
                <ab-input-field v-model="form.suffix" name="suffix" :label="t('doc.suffix')"
                  :hints="t('doc.suffix_help')" rules="max:20" />
              </div>
              <div class="col-sm-6">
                <ab-input-field v-model="form.next" name="next" :label="t('doc.next')" :hints="t('doc.next_help')"
                  rules="required|numeric" />
              </div>
              <div class="col-sm-6">
                <ab-input-field v-model="form.length" name="length" :label="t('doc.length')"
                  :hints="t('doc.length_help')" rules="required|numeric" />
              </div>
            </div>
            <AbMultiSelect v-model="form.reset" type="select" name="reset" rules="required" :label="t('doc.reset')"
              :hints="t('doc.reset_help')" :options="resetOptions" label-key="label" value-key="value" />
          </template>
        </ab-card>

        <div class="d-flex justify-content-end">
          <ab-button type="submit" color="primary">{{ t('gbl.save.changes') }}</ab-button>
        </div>
      </ab-settings-form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { AbSettingsForm, AbCard, AbAccordion, AbAccordionItem, AbBadge, AbToggle, AbField, AbMultiSelect, AbInputField, AbButton, useToast, translateGetMsg as t } from '@appsbd/vue3-appsbd-ui'
import { Zap, Eye, Mail } from 'lucide-vue-next'
import AccChevron from './AccChevron.vue'
import { openProModal } from '@admin/modules/Documents/proModal.js'
import { isPro, customFieldsAvailable } from '@lib/pro.js'
import { getDocumentType, typeText } from './documentTypes.js'
import { useDocumentSettingsStore } from './documentSettings.js'
import { usePreviewDraftStore } from './previewDraft.js'
import { translateResponseMsg } from '@lib/lang.js'

const props = defineProps({
  docType: { type: String, required: true },
  // 'numbering' shows only the numbering card; the main tab leaves it out.
  section: { type: String, default: 'main' },
})

const pro = isPro()
const customFields = customFieldsAvailable()
const store = useDocumentSettingsStore()
const { toast } = useToast()

const type = computed(() => getDocumentType(props.docType))
const isInvoice = computed(() => type.value.slug === 'invoice')
const isProforma = computed(() => type.value.slug === 'proforma-invoice')
const isCredit = computed(() => type.value.slug === 'credit-note')
const isSlip = computed(() => type.value.slug === 'packing-slip')
const isLabel = computed(() => type.value.slug === 'shipping-label')
// Packing Slip and Delivery Note share the same kind of settings (created by status, what to show, a note).
const hasPackRows = computed(() => isSlip.value || type.value.slug === 'delivery-note')
const docName = computed(() => typeText(type.value, 'title').toLowerCase())
const numberingOnly = computed(() => props.section === 'numbering')

// Option lists are computed so their labels follow the active language.
const opts = (prefix, pairs) => pairs.map(([value, key]) => ({ value, label: t(`${prefix}.${key}`) }))
const triggerOptions = computed(() => opts('doc.st', [['processing', 'processing'], ['on-hold', 'on_hold'], ['completed', 'completed']]))
// A proforma is made while the order waits for payment (On hold); after payment the invoice takes over.
// An invoice status is either made or skipped, never both: a status picked in one list is left out of the other
// (unless it is already in both from old settings, so the person can still remove it).
const inList = (list, value) => Array.isArray(list) && list.includes(value)
const triggerChoices = computed(() => {
  if (isProforma.value) return triggerOptions.value.filter((o) => o.value === 'on-hold')
  if (!isInvoice.value) return triggerOptions.value
  return triggerOptions.value.filter((o) => !inList(form.skipStatuses, o.value) || inList(form.triggers, o.value))
})
const statusOptions = computed(() => {
  const all = opts('doc.st', [['pending', 'pending'], ['on-hold', 'on_hold'], ['cancelled', 'cancelled'], ['failed', 'failed'], ['refunded', 'refunded']])
  return all.filter((o) => !inList(form.triggers, o.value) || inList(form.skipStatuses, o.value))
})
const addrOptions = computed(() => opts('doc.addr', [['never', 'never'], ['when_different', 'when_different'], ['always', 'always']]))
const dateOptions = computed(() => opts('doc.date', [['document', 'document'], ['order', 'order']]))
const resetOptions = computed(() => opts('doc.reset', [['never', 'never'], ['yearly', 'yearly'], ['monthly', 'monthly']]))
const sizeOptions = computed(() => [
  { value: '4x6', label: t('doc.label_4x6') },
  { value: 'a6', label: t('doc.label_a6') },
])

// All toggles follow Appsbd 'Y'/'N' convention.
const toForm = (src) =>
  Object.fromEntries(Object.entries(src).map(([k, v]) => [k, typeof v === 'boolean' ? (v ? 'Y' : 'N') : v]))
const fromForm = (src) => src

const form = reactive({})
// Last loaded/saved values. Only changed keys are sent, so the main and Numbering tabs (two
// instances of this form) never overwrite each other's fields with stale values.
let saved = {}
const loading = ref(false)
async function load() {
  const slug = type.value.slug
  loading.value = true
  const values = await store.load(slug)
  if (slug !== type.value.slug) return // the user moved to another document while this loaded
  Object.keys(form).forEach((k) => delete form[k])
  Object.assign(form, toForm(values))
  if (!pro) { // Product images and the QR code are Pro features: Lite never prints them.
    form.showImage = 'N'
    form.showQr = 'N'
  }
  saved = { ...form }
  if (pending) {
    Object.assign(form, toForm(pending))
    pending = null
  }
  savedTick.value++
  loading.value = false
}
watch(() => type.value.slug, load, { immediate: true })

// What this form changed, for the preview column (which lives outside the tabs): only the changed fields, so the main
// and Numbering tabs do not overwrite each other's edits.
const draft = usePreviewDraftStore()
// Unsaved edits from before a tab switch (the tab's form is rebuilt each time): put them back after loading.
let pending = draft.sections[props.docType + ':' + props.section] || null
const savedTick = ref(0)
const previewChanges = computed(() => {
  void savedTick.value
  if (loading.value) return null
  return fromForm(Object.fromEntries(Object.entries(form).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(saved[k]))))
})
const draftKey = computed(() => type.value.slug + ':' + props.section)
watch([previewChanges, draftKey], ([v, key], [, oldKey]) => {
  if (oldKey && oldKey !== key) draft.setSection(oldKey, null)
  draft.setSection(key, v)
}, { immediate: true, deep: true })

const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)

async function save() {
  try {
    const changed = Object.fromEntries(Object.entries(form).filter(([k, v]) => !isEqual(v, saved[k])))
    const res = await store.save(type.value.slug, fromForm(changed))
    if (res?.status) {
      saved = { ...form }
      savedTick.value++
      toast.success(t('doc.saved', { name: typeText(type.value, 'title') }))
      return
    }
    // The backend sends message slugs (gbl.no_update, ...), translated here.
    const bucket = translateResponseMsg(res?.msg, res?.data) || {}
      ; (bucket.error || []).forEach((item) => toast.error(item))
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

.vi-field {
  padding: 14px 0;
  border-top: 1px solid var(--bs-border-color, #e4e6ea);
}

.vi-field :deep(.mb-3) {
  margin-bottom: 0 !important;
}
</style>
