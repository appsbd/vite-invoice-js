<template>
  <ab-modal ref="modal" modal-size="modal-lg" :is-border="true" hide-form body-class="vi-stage" @close="emit('close')">
    <template #headerIcon>
      <Eye />
    </template>

    <template #headerTitle>{{ translateGetMsg('inv.preview_title') }} — {{ row.number }}</template>

    <template #body>
      <!-- The server answers with a CSP that blocks scripts and network; sandbox="" is the second lock. -->
      <iframe class="vi-inv-sheet d-block w-100" height="600" sandbox="" :src="src"
        :title="translateGetMsg('inv.preview_title')" @load="modal?.showLoader(false)"></iframe>
    </template>

    <template #footer="{ close }">
      <ab-button type="button" color="secondary" variant="outline" @click="close">
        {{ translateGetMsg('gbl.close') }}
      </ab-button>
      <ab-button type="button" color="secondary" variant="outline" :disabled="!row.has_file"
        @click="emit('print', row)">
        <Printer :size="14" /> {{ translateGetMsg('inv.print') }}
      </ab-button>
      <ab-button type="button" color="primary" :disabled="!row.has_file" @click="emit('download', row)">
        <Download :size="14" /> {{ translateGetMsg('inv.download') }}
      </ab-button>
    </template>
  </ab-modal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { AbModal, AbButton, translateGetMsg } from '@appsbd/vue3-appsbd-ui'
import { Eye, Download, Printer } from 'lucide-vue-next'
import { useDocumentsStore } from './documents.js'

const props = defineProps({
  row: { type: Object, required: true },
})
const emit = defineEmits(['close', 'download', 'print'])
const store = useDocumentsStore()
const modal = ref(null)
// Built once: the URL carries a nonce, so re-evaluating it on a re-render would reload the frame.
const src = ref(store.previewUrl(props.row.id))

onMounted(() => modal.value?.showLoader(true, translateGetMsg('gbl.loading')))
</script>

<style scoped>
.vi-inv-sheet { background: #fff; border: 0; border-radius: 6px; box-shadow: 0 8px 24px rgba(15, 23, 42, .2), 0 1px 3px rgba(15, 23, 42, .15); }
</style>
