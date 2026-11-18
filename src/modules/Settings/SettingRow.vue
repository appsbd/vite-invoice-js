<template>
  <!-- One setting, as in the UX: title and help text on the left, the control on the right.
       locked: a Pro setting without the Pro plugin: dimmed, PRO badge next to the title, the control cannot be used, and
       a click anywhere on the row opens the Pro modal (same as the locked sidebar items). -->
  <div class="vi-setting-row" :class="{ 'vi-setting-row--locked': locked }" @click="locked && openProModal()">
    <div class="vi-setting-text">
      <div class="fw-semibold">
        {{ title }}
        <ab-badge v-if="locked" color="warning" size="sm" class="ms-1">{{ translateGetMsg('gbl.pro') }}</ab-badge>
      </div>
      <div v-if="description" class="text-muted small">{{ description }}</div>
    </div>
    <div class="vi-setting-control"><slot /></div>
  </div>
</template>

<script setup>
import { AbBadge, translateGetMsg } from '@appsbd/vue3-appsbd-ui'
import { openProModal } from '@admin/modules/Documents/proModal.js'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  locked: { type: Boolean, default: false },
})
</script>

<style scoped>
.vi-setting-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 0; }
.vi-setting-row + .vi-setting-row { border-top: 1px solid var(--bs-border-color, #e4e6ea); }
.vi-setting-row:first-child { padding-top: 0; }
.vi-setting-row:last-child { padding-bottom: 0; }
.vi-setting-text { min-width: 0; }
.vi-setting-control { flex-shrink: 0; }
.vi-setting-control :deep(.apbd-toggle), .vi-setting-control :deep(.form-switch) { margin-bottom: 0; }
/* The control has no native disabled state we can rely on, so it is switched off with pointer-events; the click then
   reaches the row itself, which opens the Pro modal. */
.vi-setting-row--locked { opacity: 0.55; cursor: pointer; }
.vi-setting-row--locked .vi-setting-control { pointer-events: none; }
</style>
