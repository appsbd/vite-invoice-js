<template>
  <ab-modal modal-size="modal-md" :is-border="true" @close="emit('close')" @on-submit="onSubmit">
    <template #headerIcon>
      <FileText />
    </template>

    <template #headerTitle>{{ translateGetMsg('inv.create') }}</template>

    <template #body>
      <ab-input-field v-model="order" class="form-control-sm" name="order" type="number" :min="1" rules="required"
        autocomplete="off" :label="translateGetMsg('inv.create_order')" />
      <div class="text-muted small mt-2">{{ translateGetMsg('inv.create_help') }}</div>
    </template>

    <template #footer="{ close }">
      <ab-button type="button" color="secondary" variant="outline" @click="close">
        {{ translateGetMsg('gbl.close') }}
      </ab-button>
      <ab-button type="submit" color="primary">{{ translateGetMsg('inv.create') }}</ab-button>
    </template>
  </ab-modal>
</template>

<script setup>
import { ref } from 'vue'
import { AbModal, AbButton, AbInputField, translateGetMsg } from '@appsbd/vue3-appsbd-ui'
import { FileText } from 'lucide-vue-next'
import { translateResponseMsg } from '@lib/lang.js'
import { useDocumentsStore } from './documents.js'

const emit = defineEmits(['close', 'created'])
const store = useDocumentsStore()
const order = ref('')

async function onSubmit({ showLoader, showMsgOnly }) {
  showLoader(true, translateGetMsg('gbl.saving'))
  const res = await store.create(order.value)
  showLoader(false)
  if (res?.status) {
    showMsgOnly(translateResponseMsg(res.msg, res.data), true)
    emit('created')
  } else {
    showMsgOnly(translateResponseMsg(res?.msg, res?.data) || { error: [translateGetMsg('inv.action_failed')] }, false)
  }
}
</script>
