<template>
  <div>
    <ab-card class="p-0" body-class="p-0">
      <template #header>
        <div class="vi-head">
          <div class="vi-filters">
            <!-- Document type: scopes the whole list (and the search) to that type, Invoice first; shown when Pro adds types. -->
            <ab-multi-select v-if="multiType" v-model="selectedType" name="docTypes" size="sm"
              container-class="mb-0 vi-type-select" :options="typeOptions" label-key="label" value-key="code"
              :placeholder="translateGetMsg('inv.all_types')" :aria-label="translateGetMsg('inv.type_filter')" />
            <div class="vi-panel">
              <ab-filter-panel v-if="panelReady" :key="panelKey" size="sm" :filter-options="filterOptions"
                :default-filter-id="3" :property-select-min-width="150" @searchFilter="onFilterSearch"
                @reset="onFilterReset" />
            </div>
          </div>

          <div class="vi-actions">
            <ab-button type="button" size="sm" color="secondary" @click="reload">
              <RefreshCw /> {{ translateGetMsg('gbl.reload') }}
            </ab-button>
            <ab-button type="button" size="sm" color="primary" @click="isShowCreate = true">
              <Plus /> {{ translateGetMsg('inv.create') }}
            </ab-button>
          </div>
        </div>
      </template>
      <template #body>
        <div v-if="selected.length" class="d-flex align-items-center gap-3 p-2 px-3 border-bottom">
          <b>{{ translateGetMsg('inv.selected', { count: selected.length }) }}</b>
          <ab-button type="button" size="sm" color="secondary" variant="outline" :disabled="zipBusy"
            @click="downloadZip">
            <Download /> {{ translateGetMsg('inv.zip') }}
            <span v-if="!pro" class="badge bg-warning text-dark ms-1">PRO</span>
          </ab-button>
          <ab-button type="button" size="sm" color="secondary" variant="outline" @click="resetSelection">
            <X /> {{ tr('inv.clear_selection', 'Unselect all') }}
          </ab-button>
        </div>

        <div v-if="errorText" class="alert alert-danger mt-3 mb-0" role="alert">{{ errorText }}</div>

        <div class="row">
          <!-- fill-height needs a parent with a definite `height` (a max-height alone is not one: the grid's 100% then
               resolves to auto and the rows run out of the box). min()/max() of fixed lengths is definite. -->
          <div class="col-sm-12 " :style="isMobile ? null : { height: '730px' }">
            <elite-grid inheritRadius :is-flush="true" :fill-height="!isMobile" ref="gridRef" class="pt-0"
              :grid-data="gridData" :columns="columns" :is-rounded="true" :is-bottom-round="true"
              :is-group-separate-head="true" action-width="190px" :show-header="false" :show-action-column="true"
              :action-title="translateGetMsg('gbl.action')" :is-show-row-index-column="false"
              :is-show-row-checkbox="true" checkbox-class="form-check-input" :get-row-class="rowClass"
              selected-prop="id" :show-loader="isShowLoader" @loadData="eliteGridLoadData"
              @selectionChange="onSelection">
              <template #slotnumber="{ rowitem }">
                <span v-if="rowitem.number" class="fw-bold">{{ rowitem.number }}</span>
                <span v-else class="text-muted">&mdash;</span>
              </template>

              <template #slottype="{ rowitem }">
                <span class="vi-type" :class="typeClass(rowitem.type)">
                  <span class="vi-type__ic">
                    <component :is="typeIcon(rowitem.type)" :size="14" />
                  </span>
                  {{ typeLabel(rowitem.type) }}
                </span>
              </template>

              <template #slotorder_id="{ rowitem }">#{{ rowitem.order_id }}</template>

              <template #slottotal="{ rowitem }">
                <span v-if="rowitem.total" class="text-nowrap">{{ rowitem.total }}</span>
                <span v-else class="text-muted">&mdash;</span>
              </template>

              <template #slotstatus="{ rowitem }">
                <ab-tooltip v-if="rowitem.status === 'F'" :content="failReason(rowitem)" placement="top">
                  <ab-badge :color="statusColor(rowitem.status)" class="vi-fail">
                    <CircleAlert :size="12" /> {{ statusText(rowitem.status) }}
                  </ab-badge>
                </ab-tooltip>
                <ab-badge v-else :color="statusColor(rowitem.status)">
                  {{ statusText(rowitem.status) }}
                </ab-badge>
              </template>

              <template v-slot:actionProperty="{ rowitem }">
                <div v-if="!hasInvoice(rowitem)" class="d-flex gap-1 justify-content-sm-center justify-content-start">
                  <ab-button size="sm" :color="rowitem.status === 'F' ? 'danger' : 'primary'"
                    :disabled="busyOrders.includes(rowitem.order_id)" @click="generate(rowitem)">
                    <RotateCw v-if="rowitem.status === 'F'" :size="14" />
                    <FilePlus v-else :size="14" />
                    {{ busyOrders.includes(rowitem.order_id) ? translateGetMsg('gbl.saving') : (rowitem.status === 'F' ?
                      translateGetMsg('inv.retry') : translateGetMsg('inv.generate')) }}
                  </ab-button>
                </div>
                <div v-else class="d-flex gap-1 justify-content-sm-center justify-content-start">
                  <ab-button size="sm" color="secondary" variant="outline" v-tooltip="translateGetMsg('inv.preview')"
                    :aria-label="translateGetMsg('inv.preview')" @click="openPreview(rowitem)">
                    <Eye :size="15" />
                  </ab-button>
                  <ab-button size="sm" color="secondary" variant="outline" v-tooltip="translateGetMsg('inv.download')"
                    :aria-label="translateGetMsg('inv.download')" :disabled="!rowitem.has_file"
                    @click="download(rowitem)">
                    <Download :size="15" />
                  </ab-button>
                  <ab-button size="sm" color="secondary" variant="outline" v-tooltip="translateGetMsg('inv.print')"
                    :aria-label="translateGetMsg('inv.print')" :disabled="!rowitem.has_file" @click="printPdf(rowitem)">
                    <Printer :size="15" />
                  </ab-button>
                  <ab-confirm-popover :msg="translateGetMsg('inv.regen_confirm')"
                    :confirm-text="translateGetMsg('inv.regen_yes')" :cancel-text="translateGetMsg('gbl.no')"
                    :on-confirm="() => regenerate(rowitem)">
                    <ab-button size="sm" color="secondary" variant="outline"
                      v-tooltip="translateGetMsg('inv.regenerate')" :aria-label="translateGetMsg('inv.regenerate')">
                      <RotateCw :size="15" />
                    </ab-button>
                  </ab-confirm-popover>
                </div>
              </template>

              <template #slot-loader>
                <APBDGridLoader :msg="translateGetMsg('gbl.loading')" />
              </template>

              <template #slot-no-record>
                <div class="text-center py-5">
                  <div class="fw-bold fs-6 mb-1">
                    {{ hasFilters ? translateGetMsg('inv.nomatch_title') : translateGetMsg('inv.empty_title') }}
                  </div>
                  <div class="text-muted mb-3">
                    {{ hasFilters ? translateGetMsg('inv.nomatch_text') : translateGetMsg('inv.empty_text') }}
                  </div>
                  <ab-button v-if="hasFilters" type="button" size="sm" color="primary" @click="clearAll">
                    {{ translateGetMsg('inv.clear') }}
                  </ab-button>
                  <ab-button v-else type="button" size="sm" color="primary" @click="isShowCreate = true">
                    <Plus :size="14" /> {{ translateGetMsg('inv.create') }}
                  </ab-button>
                </div>
              </template>
            </elite-grid>
          </div>
        </div>
      </template>
    </ab-card>


  </div>

  <CreateInvoiceModal v-if="isShowCreate" @close="closeCreate" @created="onCreated" />
  <InvoicePreview v-if="previewRow" :row="previewRow" @close="previewRow = null" @download="download"
    @print="printPdf" />
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Eye, Download, Printer, RotateCw, RefreshCw, Plus, FilePlus, CircleAlert, X } from 'lucide-vue-next'
import { typeIcon, typeClass, typeRowClass } from './docTypeStyle.js'
import EliteGrid, { EliteColumnModel } from '@appsbd/vue3-elite-grid'
import { AbFilterPanel, AbMultiSelect, AbCard, AbButton, AbConfirmPopover, AbBadge, AbTooltip, useToast, translateGetMsg } from '@appsbd/vue3-appsbd-ui'
import APBDGridLoader from '@/components/APBDGridLoader.vue'
import AbRequestParam from '@lib/abRequestParam.js'
import AppsbdURL from '@lib/AppsbdURL.js'
import { isPro } from '@lib/pro.js'
import { openProModal } from './proModal.js'
import { translateResponseMsg } from '@lib/lang.js'
import { useDocumentsStore } from './documents.js'
import { useInvoiceFileActions } from './invoiceFileActions.js'
import CreateInvoiceModal from './CreateInvoiceModal.vue'
import InvoicePreview from './InvoicePreview.vue'

const store = useDocumentsStore()
const { toast } = useToast()
const busyOrders = ref([]) // order ids being generated right now
const isShowLoader = ref(false)
const isShowCreate = ref(false)
const previewRow = ref(null)
const errorText = ref('')
const searchProps = ref([]) // the applied filter, [{ propName, value, operators }]
const counts = reactive({ G: 0, R: 0, W: 0, F: 0 }) // shown next to the status names in the filter
const panelKey = ref(0) // bump to remount the filter panel and drop its chips
const panelReady = ref(false) // the panel appears after the first load, so it starts with the counts in its labels
// Label text with the translation falling back to English until the language files are rebuilt.
const tr = (key, fallback) => {
  const text = translateGetMsg(key)
  return text && text !== key ? text : fallback
}
// The document types the list can show (Invoice, plus the ones Pro adds). With only Invoice there is no Type column or filter.
const docTypes = window.apbd_vite_invoice?.document_types?.length ? window.apbd_vite_invoice.document_types : [{ code: 'I', label: 'Invoice' }]
const multiType = docTypes.length > 1
const typeLabel = (code) => docTypes.find((t) => t.code === code)?.label ?? ''
// Only a list that mixes types is colour-coded; with Invoice alone every row would be the same colour.
const rowClass = (row) => (multiType ? typeRowClass(row.type) : '')
// "All documents" leads the select and is the default; its code is not a document type, so it is never sent to the server.
const ALL_TYPES = 'all'
const typeOptions = [{ code: ALL_TYPES, label: translateGetMsg('inv.all_documents') }, ...docTypes]
const statusOptions = ['G', 'R', 'W', 'F'].map((st) => ({
  val: st, name: translateGetMsg('inv.status.' + st), label: translateGetMsg('inv.status.' + st),
}))
// Standard mode: pick a property, then its value. Each propName is a column of the documents table.
// A plain array on purpose: the panel changes these objects itself (the typed value, the chosen option), and when the prop
// is reactive that counts as a change of the options, which makes the panel fall back to the default property.
const filterOptions = [
  {
    id: 1, propName: 'status', name: translateGetMsg('gbl.status'), type: 'dd', operators: 'eq',
    optionValueProp: 'val', optionLabel: 'label', options: statusOptions,
  },
  { id: 2, propName: 'document_number', name: tr('inv.filter.number', 'Invoice number'), type: 't', operators: 'like' },
  { id: 3, propName: 'customer_name', name: translateGetMsg('inv.col.customer'), type: 't', operators: 'like' },
  { id: 4, propName: 'order_id', name: translateGetMsg('inv.col.order'), type: 't', operators: 'eq' },
]
const sortProps = ref(null);
// The panel watches its options deeply and falls back to the default property whenever they change, which would undo
// the property the user just picked. So the labels only change while nothing is applied, and the panel is remounted.
function showCounts() {
  if (searchProps.value.length > 0) {
    return
  }
  statusOptions.forEach((o) => {
    o.label = `${o.name} (${counts[o.val]})`
  })
  if (panelReady.value) {
    panelKey.value++
  }
}
const selected = ref([])
const gridRef = ref(null)
let reqSeq = 0 // only the latest list request may update the page
const gridData = reactive({ page: 1, total: 1, records: 0, limit: 20, rowdata: [] })
const hasFilters = computed(() => searchProps.value.length > 0 || chosenTypes.value.length > 0)
// "Not generated" are orders, not documents, so they come from their own endpoint.
// The chosen document type (the select beside the filter; search and status apply within it). All documents is chosen
// first; "all" or cleared = every type. Read as a list so a select that answers a list works too.
const DEFAULT_TYPE = multiType ? ALL_TYPES : ''
const selectedType = ref(DEFAULT_TYPE)
const chosenTypes = computed(() => {
  const v = selectedType.value
  return (Array.isArray(v) ? v : [v]).map((c) => String(c ?? '')).filter((c) => c && c !== ALL_TYPES)
})
// Only invoices can be "not generated" (waiting); without Invoice among the chosen types the status filter simply finds no rows.
const isWaiting = computed(() => searchProps.value.some((i) => i.propName === 'status' && i.value === 'W') && (chosenTypes.value.length === 0 || chosenTypes.value.includes('I')))

const columns = [
  EliteColumnModel.getColumn({ name: 'number', title: translateGetMsg('inv.col.number'), is_sortable: true }),
  ...(multiType ? [EliteColumnModel.getColumn({ name: 'type', title: translateGetMsg('inv.col.type'), is_sortable: false, width: '130px' })] : []),
  EliteColumnModel.getColumn({ name: 'order_id', title: translateGetMsg('inv.col.order'), is_sortable: true, width: '100px', }),
  EliteColumnModel.getColumn({ name: 'customer', title: translateGetMsg('inv.col.customer'), is_sortable: false }),
  EliteColumnModel.getColumn({ name: 'date', title: translateGetMsg('inv.col.date'), is_sortable: true, width: '130px' }),
  EliteColumnModel.getColumn({ name: 'total', title: translateGetMsg('inv.col.total'), title_align: 'right', align: 'right', is_sortable: false, width: '130px' }),
  EliteColumnModel.getColumn({ name: 'status', title: translateGetMsg('gbl.status'), title_align: 'center', align: 'center', is_sortable: false, width: '130px' }),
]

// On phones the grid grows with its rows (no fixed 600px box).
const isMobile = ref(false)
let mobileMq = null
const onMobileChange = () => { isMobile.value = mobileMq.matches }
onMounted(() => {
  mobileMq = window.matchMedia('(max-width: 767.98px)')
  onMobileChange()
  mobileMq.addEventListener('change', onMobileChange)
})

onMounted(refresh)

// Download ZIP of the selected rows is a Pro feature (module ViteInvoicePro_Bulk, action zip). The PDFs are POSTed
// as a form and read as a blob, so the number of left-out documents (no PDF file) can be shown.
const pro = isPro()
const zipBusy = ref(false)
async function downloadZip() {
  if (!pro) {
    openProModal()
    return
  }
  zipBusy.value = true
  try {
    const body = new FormData()
    body.append('ids', selected.value.join(','))
    const res = await fetch(AppsbdURL.get_module_url('ViteInvoicePro_Bulk', 'zip'), { method: 'POST', body, credentials: 'same-origin' })
    if (!res.ok) {
      const html = await res.text()
      const msg = new DOMParser().parseFromString(html, 'text/html').body?.textContent?.trim()
      toast.error(msg ? msg.split('\n')[0].slice(0, 200) : translateGetMsg('inv.zip_failed'))
      return
    }
    const skipped = parseInt(res.headers.get('X-Vinv-Zip-Skipped') || '0', 10)
    const match = /filename="?([^";]+)"?/.exec(res.headers.get('Content-Disposition') || '')
    const url = URL.createObjectURL(await res.blob())
    const link = document.createElement('a')
    link.href = url
    link.download = match ? match[1] : 'documents.zip'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 60000)
    toast.success(skipped > 0 ? translateGetMsg('inv.zip_skipped', { count: skipped }) : translateGetMsg('inv.zip_done'))
  } catch (e) {
    toast.error(translateGetMsg('inv.zip_failed'))
  } finally {
    zipBusy.value = false
  }
}

// withCounts also asks for the numbers beside the status filter, in the same request.
async function loadGridData(withCounts = false) {
  const seq = ++reqSeq
  isShowLoader.value = true
  errorText.value = ''
  const param = new AbRequestParam()
  param.limit = gridData.limit
  param.page = gridData.page
  if (withCounts) {
    param.with_counts = 'Y'
  }
  if (chosenTypes.value.length) {
    param.doc_type = chosenTypes.value.join(',') // not a table column: the server filters by these codes
  }
  for (const item of searchProps.value) {
    param.AddSrcItem(item.propName, item.value, item.operators)
  }
  if (sortProps.value && !isWaiting.value) { // The "not generated" list is orders, not documents: no column sort there.
    param.AddSortItem(sortProps.value.prop, sortProps.value.ord)
  }
  const data = await (isWaiting.value ? store.getWaiting(param) : store.getList(param))
  if (seq !== reqSeq) {
    return
  }
  if (data) {
    gridData.page = data.page || 1
    gridData.limit = data.limit || 20
    gridData.records = data.records || 0
    gridData.total = data.total || 1
    gridData.rowdata = data.rowdata || []
    if (data.counts) {
      Object.assign(counts, data.counts)
      showCounts()
    }
  } else {
    errorText.value = translateGetMsg('inv.load_failed')
  }
  isShowLoader.value = false
  panelReady.value = true
}

// The list plus the numbers beside the status filter, in one request (a filter or page change only needs the list).
function refresh() {
  return loadGridData(true)
}

// Drop ticked rows: after a filter change or reload they may no longer be visible.
// clearSelection() only emits when something was selected, so reset our copy too.
function resetSelection() {
  gridRef.value?.clearSelection?.()
  selected.value = []
}

function reload() {
  resetSelection()
  refresh()
}

function statusColor(st) {
  return st === 'G' ? 'success' : st === 'R' ? 'info' : st === 'F' ? 'danger' : st === 'W' ? 'warning' : 'secondary'
}

function statusText(st) {
  return ['G', 'R', 'W', 'F'].includes(st) ? translateGetMsg('inv.status.' + st) : String(st ?? '')
}

// Waiting and failed rows have no invoice (and no PDF) yet.
function hasInvoice(row) {
  return row.status === 'G' || row.status === 'R'
}

// The tooltip on a failed row: the reason the last attempt gave (an add-on's specific reason, row.error_text, wins).
function failReason(row) {
  if (typeof row.error_text === 'string' && row.error_text !== '') return row.error_text
  const key = 'inv.err_' + (row.error || 'db')
  const text = translateGetMsg(key)
  return text && text !== key ? text : translateGetMsg('inv.err_db')
}

// Grid column name -> the documents column the server sorts by.
const SORT_COLUMN = { number: 'document_number', order_id: 'order_id', date: 'created_at' }

function eliteGridLoadData(gparam) {
  gridData.limit = gparam.limit
  gridData.page = gparam.page
  sortProps.value = SORT_COLUMN[gparam.sort_prop] ? { prop: SORT_COLUMN[gparam.sort_prop], ord: gparam.sort_ord } : null
  loadGridData()
}

function onFilterSearch(items) {
  searchProps.value = Array.isArray(items) ? items.filter((i) => i.value !== '' && i.value != null) : []
  resetSelection()
  gridData.page = 1
  loadGridData()
}

// Another document type: back to page 1, and the status numbers are for that type. A watcher, not the select's change
// event, so the list is asked for after the new value is in place.
watch(selectedType, () => {
  resetSelection()
  gridData.page = 1
  refresh()
})

function onFilterReset() {
  onFilterSearch([])
}

function clearAll() {
  // The remounted panel reuses these objects, so drop what it left on them.
  filterOptions.forEach((o) => {
    o.value = ''
  })
  statusOptions.forEach((o) => {
    o.isSelected = false
  })
  panelKey.value++
  searchProps.value = []
  resetSelection()
  gridData.page = 1
  if (selectedType.value !== DEFAULT_TYPE) {
    selectedType.value = DEFAULT_TYPE // the watcher above reloads
  } else {
    refresh()
  }
}

function onSelection(ids) {
  selected.value = Array.isArray(ids) ? ids : []
}

let closeTimer = null

function closeCreate() {
  clearTimeout(closeTimer)
  isShowCreate.value = false
}

// Reload at once; keep the modal open for a moment so its success message can be read.
function onCreated() {
  resetSelection()
  gridData.page = 1
  refresh()
  clearTimeout(closeTimer)
  closeTimer = setTimeout(closeCreate, 900)
}

onBeforeUnmount(() => {
  mobileMq?.removeEventListener('change', onMobileChange)
  clearTimeout(closeTimer)
})

function openPreview(row) {
  previewRow.value = row
}

const { download, printPdf } = useInvoiceFileActions()

// Generate (or retry) the invoice of an order that has none. A failure is recorded by the server, so the row turns
// into "Failed" with its reason after the reload.
async function generate(row) {
  if (busyOrders.value.includes(row.order_id)) {
    return
  }
  busyOrders.value = [...busyOrders.value, row.order_id]
  try {
    const res = await store.create(row.order_id, row.type || 'I')
    const ok = !!res?.status
    const bucket = translateResponseMsg(res?.msg, res?.data)
    const message = (ok ? bucket?.info?.[0] : bucket?.error?.[0]) || translateGetMsg('inv.action_failed')
    if (ok) {
      toast.success(message)
    } else {
      toast.error(message)
    }
    resetSelection()
    await refresh()
  } finally {
    busyOrders.value = busyOrders.value.filter((id) => id !== row.order_id)
  }
}

// AbConfirmPopover shows the returned { status, message } itself.
async function regenerate(row) {
  const res = await store.regenerate(row.id)
  const ok = !!res?.status
  const bucket = translateResponseMsg(res?.msg, res?.data)
  const message = (ok ? bucket?.info?.[0] : bucket?.error?.[0]) || translateGetMsg('inv.action_failed')
  if (ok) {
    resetSelection()
    refresh()
  }
  return { status: ok, message }
}
</script>

<style scoped>
/* Header: filters on the left, actions on the right; below 992px the actions drop under the filters and
   below 576px every part takes the full width, so nothing is squeezed into a few pixels. */
.vi-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px 12px;
}

.vi-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
  flex: 1 1 520px;
  min-width: 0;
}

.vi-panel {
  flex: 1 1 340px;
  min-width: 0;
}

.vi-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  flex: none;
}

.vi-type-select {
  width: auto;
  min-width: 230px;
  flex: none;
}

@media (max-width: 991.98px) {

  .vi-filters,
  .vi-actions {
    flex: 1 1 100%;
  }
}

@media (max-width: 575.98px) {
  .vi-type-select {
    width: 100%;
    min-width: 0;
  }

  .vi-panel {
    flex-basis: 100%;
  }
}

/* The panel's property select, value box and buttons wrap as a group instead of shrinking the value box. */
.vi-panel :deep(.d-flex.flex-wrap) {
  min-width: 0;
}

.vi-panel :deep(input[type='text']),
.vi-panel :deep(input:not([type])) {
  min-width: 120px;
}

.vi-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 0 16px;
}

.vi-filter {
  flex: 1 1 320px;
  padding: 8px 0;
}

/* Reload (icon only) and Create invoice share one height; reload is a square of that height. */
.vi-actions :deep(.btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 34px;
  padding-top: 0;
  padding-bottom: 0;
  line-height: 1;
}

.vi-actions :deep(.btn.vi-icon-btn) {
  width: 34px;
  padding-left: 0;
  padding-right: 0;
}

.vi-actions :deep(.btn svg) {
  width: 16px;
  height: 16px;
}

.vi-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

/* The select column is 25px wide with hidden overflow, and Bootstrap pulls a form-check-input 1.5em to the left,
   so the box was cut off at the table edge. Give the column room and keep the box in the middle of it. */
:deep(.eg-r-select) {
  width: 48px;
  min-width: 48px;
  max-width: 48px !important;
  padding-left: 10px;
  padding-right: 10px;
}

/* The panel's own rule (#wpbody .appsbd-app input[type=checkbox]) pulls every checkbox 1.5em to the left. */
:deep(.eg-r-select input[type='checkbox']) {
  float: none;
  margin: 0 !important;
  cursor: pointer;
  flex: none;
}

/* One row of icon buttons per invoice: the action cell never wraps. */
:deep(.eg-cell-action .btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.eg-cell-action .d-flex) {
  flex-wrap: nowrap;
}
</style>
