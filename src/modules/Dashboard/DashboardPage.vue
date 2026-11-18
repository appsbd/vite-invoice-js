<template>
  <div class="">
    <div v-if="failed" class="alert alert-danger" role="alert">{{ t('dash.load_failed') }}</div>

    <!-- The four numbers -->
    <div class="vi-stats">
      <div v-for="s in statCards" :key="s.key" class="vi-stat" :class="'vi-tone-' + s.tone">
        <div class="vi-stat-icon">
          <component :is="s.icon" :size="20" />
        </div>
        <div class="vi-stat-body">
          <div class="vi-stat-label">{{ s.label }}</div>
          <ab-skeleton v-if="loading" style="height: 30px; width: 80px;" class="my-1" />
          <div v-else class="vi-stat-value">{{ s.value }}</div>
        </div>
      </div>
    </div>

    <!-- Four small cards in one row -->
    <div class="vi-quad mt-3">
      <!-- Setup checklist -->
      <ab-card show-border container-class="h-100">
        <template #header>
          <div class="d-flex justify-content-between align-items-center w-100">
            <span class="fw-bold">{{ t('dash.setup') }}</span>
            <ab-badge :color="doneCount === steps.length ? 'success' : 'secondary'">
              {{ t('dash.setup_of', { done: doneCount, total: steps.length }) }}
            </ab-badge>
          </div>
        </template>
        <template #body>
          <div class="vi-progress mb-2"><i :style="{ width: (doneCount / steps.length) * 100 + '%' }"></i></div>
          <router-link v-for="st in steps" :key="st.key" :to="st.to" class="vi-step">
            <span class="vi-check" :class="{ done: st.done }">
              <Check :size="11" />
            </span>
            <span :class="st.done ? 'text-body' : 'fw-semibold'">{{ st.label }}</span>
            <ChevronRight :size="15" class="ms-auto text-muted" />
          </router-link>
        </template>
      </ab-card>

      <!-- Quick actions -->
      <ab-card show-border container-class="h-100">
        <template #header><span class="fw-bold">{{ t('dash.quick') }}</span></template>
        <template #body>
          <div class="d-flex flex-column gap-2">
            <ab-button type="button" size="sm" color="secondary" variant="outline" class="vi-quick"
              @click="router.push('/templates')">
              <Palette :size="15" /> {{ t('dash.edit_design') }}
            </ab-button>
            <ab-button type="button" size="sm" color="secondary" variant="outline" class="vi-quick" @click="goSettings">
              <Settings :size="15" /> {{ t('dash.invoice_settings') }}
            </ab-button>
            <ab-button type="button" size="sm" color="secondary" variant="outline" class="vi-quick"
              @click="isShowCreate = true">
              <FilePlus :size="15" /> {{ t('inv.create') }}
            </ab-button>
          </div>
        </template>
      </ab-card>

      <!-- Documents by type -->
      <ab-card show-border container-class="h-100">
        <template #header>
          <div class="d-flex justify-content-between align-items-center w-100">
            <span class="fw-bold">{{ t('dash.by_type') }}</span>
            <router-link :to="{ name: 'documents' }" class="small fw-semibold">{{ t('dash.manage') }}</router-link>
          </div>
        </template>
        <template #body>
          <div v-for="d in DOCUMENT_TYPES" :key="d.slug" class="vi-line vi-line-link" role="link" tabindex="0"
            @click="openType(d)" @keydown.enter="openType(d)">
            <span>{{ typeText(d, 'title') }}</span>
            <ab-badge v-if="d.pro && !pro" color="warning" size="sm">{{ t('gbl.pro') }}</ab-badge>
            <b v-else>{{ typeCounts[d.slug] ?? 0 }}</b>
          </div>
        </template>
      </ab-card>

      <!-- Compliance and storage: live in Pro, shown locked in Lite -->
      <ab-card show-border container-class="h-100">
        <template #header>
          <div class="d-flex justify-content-between align-items-center w-100">
            <span class="fw-bold">{{ t('dash.compliance_storage') }}</span>
            <ab-badge v-if="!pro" color="warning" size="sm">{{ t('gbl.pro') }}</ab-badge>
          </div>
        </template>
        <template #body>
          <div v-for="i in extras" :key="i.key" class="vi-line" :class="{ 'vi-line-link': i.go }"
            :role="i.go ? 'link' : null" :tabindex="i.go ? 0 : null" @click="i.go && i.go()"
            @keydown.enter="i.go && i.go()">
            <span>{{ i.label }}</span>
            <ab-badge :color="i.color" size="sm">{{ i.badge }}</ab-badge>
          </div>
          <a v-if="!pro" href="#" class="fw-semibold small d-inline-block mt-2" @click.prevent="openProModal">{{
            t('docs.unlock') }}</a>
        </template>
      </ab-card>
    </div>

    <!-- The latest invoices, full width -->
    <div class="mt-3">
      <ab-card show-border body-class="p-0" container-class="vi-recent">
        <template #header>
          <div class="d-flex justify-content-between align-items-center w-100">
            <span class="fw-bold">{{ t('dash.recent') }}</span>
            <div class="d-flex align-items-center gap-2">
              <ab-button type="button" size="sm" color="secondary" variant="outline" v-tooltip="t('dash.refresh')"
                :aria-label="t('dash.refresh')" :disabled="loading || refreshing" @click="refresh">
                <RefreshCw :size="14" />
              </ab-button>
              <router-link :to="{ name: 'invoices' }" class="small fw-semibold d-inline-flex align-items-center gap-1">
                {{ t('dash.see_all') }}
                <ArrowRight :size="14" />
              </router-link>
            </div>
          </div>
        </template>
        <template #body>
          <elite-grid class="pt-0" :grid-data="gridData" :columns="columns" :is-rounded="false" :show-header="false"
            :show-action-column="true" :is-bottom-round="true" :action-title="t('gbl.action')" action-width="150px"
            :is-show-row-index-column="false" :show-loader="loading || refreshing" :hide-pagination="true"
            @loadData="onGridSort" :get-row-class="(row) => typeRowClass(row.type)">
            <template #slotnumber="{ rowitem }">
              <span class="vi-type" :class="typeClass(rowitem.type)">
                <span class="vi-type__ic">
                  <component :is="typeIcon(rowitem.type)" :size="14" />
                </span>
                <span v-if="rowitem.number" class="fw-bold">{{ rowitem.number }}</span>
                <span v-else class="text-muted">&mdash;</span>
              </span>
            </template>
            <template #slottotal="{ rowitem }"><span class="text-nowrap">{{ rowitem.total }}</span></template>
            <template #slotstatus="{ rowitem }">
              <ab-badge :color="statusColor(rowitem.status)">{{ statusText(rowitem.status) }}</ab-badge>
            </template>
            <template #actionProperty="{ rowitem }">
              <div v-if="hasInvoice(rowitem)" class="d-flex gap-1 justify-content-sm-center justify-content-start">
                <ab-button size="sm" color="secondary" variant="outline" v-tooltip="t('inv.preview')"
                  :aria-label="t('inv.preview')" @click="previewRow = rowitem">
                  <Eye :size="15" />
                </ab-button>
                <ab-button size="sm" color="secondary" variant="outline" v-tooltip="t('inv.download')"
                  :aria-label="t('inv.download')" :disabled="!rowitem.has_file" @click="download(rowitem)">
                  <Download :size="15" />
                </ab-button>
                <ab-button size="sm" color="secondary" variant="outline" v-tooltip="t('inv.print')"
                  :aria-label="t('inv.print')" :disabled="!rowitem.has_file" @click="printPdf(rowitem)">
                  <Printer :size="15" />
                </ab-button>
              </div>
              <ab-button v-else size="sm" color="danger" :disabled="busyOrders.includes(rowitem.order_id)"
                @click="retry(rowitem)">
                <RotateCw :size="14" />
                {{ busyOrders.includes(rowitem.order_id) ? t('gbl.saving') : t('inv.retry') }}
              </ab-button>
            </template>
            <template #slot-loader>
              <APBDGridLoader :msg="t('gbl.loading')" />
            </template>
            <template #slot-no-record>
              <div class="p-4 text-center">
                <div class="fw-semibold mb-1">{{ t('inv.empty_title') }}</div>
                <div class="text-muted small mb-3">{{ t('inv.empty_text') }}</div>
                <ab-button type="button" color="primary" size="sm" @click="goSettings">{{ t('dash.check_settings')
                }}</ab-button>
              </div>
            </template>
          </elite-grid>
        </template>
      </ab-card>

    </div>
  </div>

  <CreateInvoiceModal v-if="isShowCreate" @close="closeCreate" @created="onCreated" />
  <InvoicePreview v-if="previewRow" :row="previewRow" @close="previewRow = null" @download="download"
    @print="printPdf" />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Check, ChevronRight, Clock, Download, Eye, FileCheck2, FilePlus, Palette, Printer, RefreshCw, RotateCw, Settings, TriangleAlert, Wallet } from 'lucide-vue-next'
import APBDGridLoader from '@/components/APBDGridLoader.vue'
import EliteGrid, { EliteColumnModel } from '@appsbd/vue3-elite-grid'
import { AbCard, AbBadge, AbButton, AbSkeleton, useToast, translateGetMsg as t } from '@appsbd/vue3-appsbd-ui'
import { translateResponseMsg } from '@lib/lang.js'
import { isPro } from '@lib/pro.js'
import { useDocumentsStore } from '@admin/modules/Documents/documents.js'
import { useSettingsStore } from '@admin/modules/Settings/settings.js'
import { fromServer } from '@admin/modules/Compliance/complianceModel.js'
import { useInvoiceFileActions } from '@admin/modules/Documents/invoiceFileActions.js'
import { openProModal } from '@admin/modules/Documents/proModal.js'
import { typeIcon, typeClass, typeRowClass } from '@admin/modules/Documents/docTypeStyle.js'
import InvoicePreview from '@admin/modules/Documents/InvoicePreview.vue'
import CreateInvoiceModal from '@admin/modules/Documents/CreateInvoiceModal.vue'
import { DOCUMENT_TYPES, documentRouteName, typeText } from '@admin/modules/Settings/documentTypes.js'

const router = useRouter()
const store = useDocumentsStore()
const { download, printPdf } = useInvoiceFileActions()
const pro = isPro()
const loading = ref(true)
const failed = ref(false)
const data = ref(null)
const previewRow = ref(null)
const zatcaOn = ref('N') // ZATCA switch (Pro), read from the settings payload
// The grid only shows the latest rows: no paging, no sorting.
const gridData = reactive({ page: 1, total: 1, records: 0, limit: 5, rowdata: [] })

const { toast } = useToast()
const isShowCreate = ref(false)
const busyOrders = ref([]) // order ids being retried right now
let closeTimer = null

// First load shows the skeletons; a reload after an action keeps the page as it is and swaps the numbers in.
async function load(first = false) {
  if (first) loading.value = true
  const settingsLoad = loadZatca()
  data.value = await store.dashboard()
  if (settingsLoad) await settingsLoad
  failed.value = !data.value
  // The latest list is invoices only, and its rows carry no type code.
  gridData.rowdata = sortRows((data.value?.recent ?? []).map((row) => ({ ...row, type: row.type || 'I' })))
  gridData.records = gridData.rowdata.length
  loading.value = false
}
onMounted(() => load(true))

// The ON/OFF state of the ZATCA row. A failure only leaves the row at OFF.
async function loadZatca() {
  try {
    const res = await useSettingsStore().fetchSettings()
    zatcaOn.value = res?.status && fromServer(res.data).enabled === 'Y' ? 'Y' : 'N'
  } catch (e) {
    zatcaOn.value = 'N'
  }
}

// Reload every number and the latest list without the skeletons.
const refreshing = ref(false)
async function refresh() {
  if (refreshing.value) return
  refreshing.value = true
  try {
    await load()
  } finally {
    refreshing.value = false
  }
}
onBeforeUnmount(() => clearTimeout(closeTimer))

// Same as the Invoices list: the modal shows its own result, then closes and the numbers refresh.
function closeCreate() {
  clearTimeout(closeTimer)
  isShowCreate.value = false
}
function onCreated() {
  load()
  clearTimeout(closeTimer)
  closeTimer = setTimeout(closeCreate, 900)
}

// Retry a failed invoice without leaving the dashboard.
async function retry(row) {
  if (busyOrders.value.includes(row.order_id)) return
  busyOrders.value = [...busyOrders.value, row.order_id]
  try {
    const res = await store.create(row.order_id)
    const ok = !!res?.status
    const bucket = translateResponseMsg(res?.msg, res?.data)
    const message = (ok ? bucket?.info?.[0] : bucket?.error?.[0]) || t('inv.action_failed')
    if (ok) toast.success(message)
    else toast.error(message)
    await load()
  } finally {
    busyOrders.value = busyOrders.value.filter((id) => id !== row.order_id)
  }
}

const stats = computed(() => data.value?.stats ?? { generated: 0, waiting: 0, failed: 0, total: '' })
const setup = computed(() => data.value?.setup ?? {})
const typeCounts = computed(() => data.value?.types ?? {})

// Only five rows, so the grid sorts them here in the browser; Total is a formatted string and stays unsorted.
const sortProps = ref(null)
const SORT_KEY = { date: 'id' } // the shown date is text; the id follows the creation order
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
function sortRows(rows) {
  if (!sortProps.value) return rows
  const key = SORT_KEY[sortProps.value.prop] || sortProps.value.prop
  const dir = String(sortProps.value.ord).toLowerCase() === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => dir * collator.compare(String(a[key] ?? ''), String(b[key] ?? '')))
}
function onGridSort(gparam) {
  sortProps.value = gparam?.sort_prop ? { prop: gparam.sort_prop, ord: gparam.sort_ord } : null
  gridData.rowdata = sortRows(gridData.rowdata)
}

const columns = [
  EliteColumnModel.getColumn({ name: 'number', title: t('inv.col.number'), is_sortable: true }),
  EliteColumnModel.getColumn({ name: 'customer', title: t('inv.col.customer'), is_sortable: true }),
  EliteColumnModel.getColumn({ name: 'date', title: t('inv.col.date'), is_sortable: true, width: '120px' }),
  EliteColumnModel.getColumn({ name: 'total', title: t('inv.col.total'), title_align: 'right', align: 'right', is_sortable: false, width: '110px' }),
  EliteColumnModel.getColumn({ name: 'status', title: t('gbl.status'), title_align: 'center', align: 'center', is_sortable: true, width: '120px' }),
]

const statCards = computed(() => [
  { key: 'generated', tone: 'green', icon: FileCheck2, label: t('dash.generated'), value: stats.value.generated },
  { key: 'waiting', tone: 'amber', icon: Clock, label: t('dash.waiting'), value: stats.value.waiting },
  { key: 'failed', tone: stats.value.failed > 0 ? 'red' : 'gray', icon: TriangleAlert, label: t('dash.attention'), value: stats.value.failed },
  { key: 'total', tone: 'violet', icon: Wallet, label: t('dash.total'), value: stats.value.total },
])

const steps = computed(() => [
  { key: 'company', label: t('dash.step_company'), done: !!setup.value.company, to: '/settings/general' },
  { key: 'numbering', label: t('dash.step_numbering'), done: !!setup.value.numbering, to: { path: '/settings/invoice', query: { tab: 'numbering' } } },
  { key: 'template', label: t('dash.step_template'), done: !!setup.value.template, to: '/templates' },
  { key: 'email', label: t('dash.step_email'), done: !!setup.value.email, to: '/emails' },
])
const doneCount = computed(() => steps.value.filter((s) => s.done).length)

// Veri*Factu is not built yet. ZATCA, scheduled export and cloud storage are live in Pro (state from the API) and locked in Lite.
const CLOUD_NAMES = { gdrive: 'stor.gdrive_title', dropbox: 'stor.dropbox_title' }
const extras = computed(() => {
  const soon = (key, label) => ({ key, label, badge: t('docs.coming_soon'), color: 'secondary' })
  const live = data.value?.extras ?? {}
  const schedule = live.scheduled_export
  const cloud = live.cloud_storage
  let scheduleRow = { key: 'scheduled', label: t('dash.scheduled_export'), badge: t('gbl.pro'), color: 'warning', go: openProModal }
  const zatcaRow = { key: 'zatca', label: t('docs.zatca.title'), badge: t(zatcaOn.value === 'Y' ? 'dash.state_on' : 'dash.state_off'), color: zatcaOn.value === 'Y' ? 'success' : 'secondary', go: () => router.push('/compliance') } // ZATCA is a Lite feature.
  let cloudRow = { key: 'cloud', label: t('dash.cloud_storage'), badge: t('gbl.pro'), color: 'warning', go: openProModal }
  if (pro) {
    scheduleRow = { key: 'scheduled', label: t('dash.scheduled_export'), badge: t(schedule?.on === 'Y' ? 'dash.state_on' : 'dash.state_off'), color: schedule?.on === 'Y' ? 'success' : 'secondary', go: () => router.push('/bulk') }
    const named = CLOUD_NAMES[cloud?.provider]
    cloudRow = {
      key: 'cloud',
      label: t('dash.cloud_storage'),
      badge: cloud?.reconnect ? t('dash.reconnect') : named ? t(named) : t('dash.local_only'),
      color: cloud?.reconnect ? 'danger' : named ? 'success' : 'secondary',
      go: () => router.push('/storage'),
    }
  }
  return [zatcaRow, soon('verifactu', t('docs.verifactu.title')), scheduleRow, cloudRow]
})

const goSettings = () => router.push('/settings/invoice')
// A Pro type without Pro opens the shared Pro modal (and never navigates); otherwise its settings page.
const openType = (d) => (d.pro && !pro ? openProModal() : router.push({ name: documentRouteName(d.slug) }))
const hasInvoice = (r) => r.status === 'G' || r.status === 'R'
const statusColor = (st) => (st === 'G' ? 'success' : st === 'R' ? 'info' : st === 'F' ? 'danger' : st === 'W' ? 'warning' : 'secondary')
const statusText = (st) => (['G', 'R', 'W', 'F'].includes(st) ? t('inv.status.' + st) : String(st ?? ''))
</script>

<style scoped>
/* The recent-invoices grid sits inside a bordered card: its own border would draw a second (white in dark mode) frame. */
.vi-recent :deep(.elite-grid) {
  border: 0;
}

.vi-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.vi-stat {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 18px;
  background: var(--bs-body-bg, #fff);
  border: 1px solid var(--bs-border-color, #e4e6ea);
  border-radius: 12px;
}

.vi-stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  background: var(--vi-tint);
  color: var(--vi-ink);
}

.vi-stat-label {
  font-size: 13px;
  color: var(--bs-secondary-color, #6b7280);
}

.vi-stat-value {
  font-size: 1.9rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 2px 0;
  color: var(--vi-value, inherit);
}

.vi-tone-green {
  --vi-tint: rgba(31, 122, 77, .12);
  --vi-ink: #1f7a4d;
}

.vi-tone-amber {
  --vi-tint: rgba(194, 120, 3, .14);
  --vi-ink: #b36b00;
}

.vi-tone-red {
  --vi-tint: rgba(179, 45, 46, .12);
  --vi-ink: #b32d2e;
  --vi-value: #b32d2e;
}

.vi-tone-violet {
  --vi-tint: rgba(127, 84, 179, .13);
  --vi-ink: #7f54b3;
}

.vi-tone-gray {
  --vi-tint: rgba(107, 114, 128, .12);
  --vi-ink: #6b7280;
}

.vi-quad {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  align-items: stretch;
}

@media (min-width: 768px) {
  .vi-quad {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1200px) {
  .vi-quad {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.vi-progress {
  height: 8px;
  border-radius: 99px;
  background: var(--bs-border-color, #e4e6ea);
  overflow: hidden;
}

.vi-progress i {
  display: block;
  height: 100%;
  border-radius: 99px;
  background: var(--bs-primary, #7f54b3);
  transition: width .3s ease;
}

.vi-step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid var(--bs-border-color, #eceef0);
}

.vi-step:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.vi-step:hover span:not(.vi-check) {
  color: var(--bs-primary, #7f54b3);
}

.vi-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  border: 1px solid var(--bs-border-color, #cfd3d8);
  color: transparent;
}

.vi-check.done {
  background: #1f7a4d;
  border-color: #1f7a4d;
  color: #fff;
}

.vi-quick {
  width: 100%;
  justify-content: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.vi-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  gap: 8px;
  border-bottom: 1px solid var(--bs-border-color, #eceef0);
}

.vi-line:last-of-type {
  border-bottom: 0;
}

.vi-line-link {
  cursor: pointer;
}

.vi-line-link:hover span {
  color: var(--bs-primary, #7f54b3);
}
</style>
